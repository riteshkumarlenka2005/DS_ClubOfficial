import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { generateQRToken, verifyQRToken, QRPayload } from '../utils/qr-signing';

/**
 * POST /api/attendance/scan
 * Student scans QR → mark attendance
 */
export async function scanAttendance(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { token } = req.body as { token: string };

    if (!token) {
      return res.status(400).json({ success: false, message: 'QR token is required', data: null });
    }

    // Parse the QR payload
    let payload: QRPayload;
    try {
      payload = JSON.parse(token);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid QR code format', data: null });
    }

    // Verify signature & expiration
    const verification = verifyQRToken(payload);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.reason, data: null });
    }

    const eventId = verification.eventId!;

    // Verify event exists
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('event_attendance')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for this event',
        data: { event_title: event.title },
      });
    }

    // Insert attendance
    const deviceInfo = req.headers['user-agent'] || null;
    const { data: attendance, error: insertErr } = await supabase
      .from('event_attendance')
      .insert({
        event_id: eventId,
        user_id: userId,
        device_info: deviceInfo,
        verified: true,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Attendance insert error:', insertErr);
      return res.status(500).json({ success: false, message: 'Failed to mark attendance', data: null });
    }

    return res.json({
      success: true,
      message: `Attendance marked for "${event.title}"`,
      data: attendance,
    });
  } catch (err) {
    console.error('scanAttendance error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/attendance/my
 * Fetch current user's attendance history
 */
export async function getMyAttendance(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        id,
        scanned_at,
        verified,
        events:event_id (
          id,
          title,
          slug,
          event_date,
          venue,
          cover_image
        )
      `)
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false });

    if (error) {
      console.error('getMyAttendance error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch attendance', data: null });
    }

    return res.json({ success: true, data, message: '' });
  } catch (err) {
    console.error('getMyAttendance error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/attendance/summary
 * Summary stats for current user
 */
export async function getMyAttendanceSummary(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const { count: totalAttended } = await supabase
      .from('event_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalCertificates } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalContributions } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'verified');

    return res.json({
      success: true,
      data: {
        total_attended: totalAttended || 0,
        total_certificates: totalCertificates || 0,
        total_contributions: totalContributions || 0,
      },
      message: '',
    });
  } catch (err) {
    console.error('getMyAttendanceSummary error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * POST /api/attendance/admin/generate-qr
 * Admin generates signed QR for an event
 */
export async function generateEventQR(req: Request, res: Response) {
  try {
    const { event_id, expires_in_minutes = 60 } = req.body;

    if (!event_id) {
      return res.status(400).json({ success: false, message: 'event_id is required', data: null });
    }

    // Verify event exists
    const { data: event, error } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', event_id)
      .single();

    if (error || !event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }

    const qrPayload = generateQRToken(event_id, expires_in_minutes);

    return res.json({
      success: true,
      data: {
        qr_content: JSON.stringify(qrPayload),
        event_title: event.title,
        expires_at: new Date(qrPayload.x).toISOString(),
        expires_in_minutes,
      },
      message: 'QR generated successfully',
    });
  } catch (err) {
    console.error('generateEventQR error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/attendance/admin/event/:eventId
 * Admin views full attendance for an event
 */
export async function getEventAttendance(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        id,
        scanned_at,
        verified,
        device_info,
        users:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('event_id', eventId)
      .order('scanned_at', { ascending: true });

    if (error) {
      console.error('getEventAttendance error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch attendance', data: null });
    }

    // Also get event info
    const { data: event } = await supabase
      .from('events')
      .select('id, title, event_date')
      .eq('id', eventId)
      .single();

    return res.json({
      success: true,
      data: { event, attendance: data, total: data?.length || 0 },
      message: '',
    });
  } catch (err) {
    console.error('getEventAttendance error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/attendance/admin/event/:eventId/export
 * Export CSV for an event's attendance
 */
export async function exportEventAttendanceCSV(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    const { data: event } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        scanned_at,
        verified,
        users:user_id (
          full_name,
          email
        )
      `)
      .eq('event_id', eventId)
      .order('scanned_at', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to export', data: null });
    }

    // Build CSV
    const rows = [['Name', 'Email', 'Scan Time', 'Verified']];
    for (const record of data || []) {
      const user = record.users as any;
      rows.push([
        user?.full_name || 'N/A',
        user?.email || 'N/A',
        new Date(record.scanned_at).toLocaleString(),
        record.verified ? 'Yes' : 'No',
      ]);
    }

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const filename = `attendance_${event?.title?.replace(/\s+/g, '_') || eventId}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    console.error('exportCSV error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * DELETE /api/attendance/admin/:attendanceId
 */
export async function deleteAttendanceRecord(req: Request, res: Response) {
  try {
    const { attendanceId } = req.params;

    const { error } = await supabase
      .from('event_attendance')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete', data: null });
    }

    return res.json({ success: true, message: 'Attendance record deleted', data: null });
  } catch (err) {
    console.error('deleteAttendance error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}
