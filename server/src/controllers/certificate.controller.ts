import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * POST /api/certificates/admin/generate
 * Admin generates a certificate for a user who attended
 */
export async function generateCertificate(req: Request, res: Response) {
  try {
    const adminId = req.user!.userId;
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({ success: false, message: 'user_id and event_id are required', data: null });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user_id)
      .eq('event_id', event_id)
      .single();

    if (existingCert) {
      return res.status(409).json({ success: false, message: 'Certificate already generated for this user and event', data: null });
    }

    // 1. Fetch user and event
    const { data: user } = await supabase.from('users').select('full_name').eq('id', user_id).single();
    const { data: event } = await supabase.from('events').select('title, event_date').eq('id', event_id).single();

    if (!user || !event) {
      return res.status(404).json({ success: false, message: 'User or Event not found', data: null });
    }

    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 600]);
    const { width, height } = page.getSize();
    
    // Add simple design
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    page.drawText('Certificate of Participation', { x: width / 2 - 200, y: height - 150, size: 30, font, color: rgb(0.2, 0.2, 0.6) });
    page.drawText('This is to certify that', { x: width / 2 - 100, y: height - 250, size: 20, font: textFont });
    page.drawText(user.full_name, { x: width / 2 - (user.full_name.length * 8), y: height - 320, size: 35, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`has successfully participated in`, { x: width / 2 - 150, y: height - 400, size: 20, font: textFont });
    page.drawText(event.title, { x: width / 2 - (event.title.length * 8), y: height - 460, size: 25, font, color: rgb(0.4, 0.2, 0.7) });
    
    const pdfBytes = await pdfDoc.save();

    // 3. Upload to Supabase Storage
    const fileName = `${user_id}/${uuidv4()}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'File upload failed', data: null });
    }

    // 4. Save to DB
    const { data: cert, error: insertErr } = await supabase
      .from('certificates')
      .insert({
        user_id,
        event_id,
        certificate_title: `Certificate: ${event.title}`,
        file_path: fileName,
        uploaded_by: adminId,
      })
      .select()
      .single();

    if (insertErr) {
      await supabase.storage.from('certificates').remove([fileName]);
      return res.status(500).json({ success: false, message: 'Failed to save certificate record', data: null });
    }

    return res.json({
      success: true,
      message: `Certificate generated for ${user.full_name}`,
      data: cert,
    });
  } catch (err) {
    console.error('generateCertificate error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * POST /api/certificates/admin/upload
 * Admin uploads certificate PDF for a user
 */
export async function uploadCertificate(req: Request, res: Response) {
  try {
    const adminId = req.user!.userId;
    const { user_id, event_id, certificate_title } = req.body;
    const file = req.file;

    if (!file || !user_id || !certificate_title) {
      return res.status(400).json({
        success: false,
        message: 'file, user_id, and certificate_title are required',
        data: null,
      });
    }

    // Verify target user exists
    const { data: targetUser, error: userErr } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', user_id)
      .single();

    if (userErr || !targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found', data: null });
    }

    // Upload to Supabase Storage
    const fileExt = 'pdf';
    const fileName = `${user_id}/${uuidv4()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from('certificates')
      .upload(fileName, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'File upload failed', data: null });
    }

    // Insert DB record
    const { data: cert, error: insertErr } = await supabase
      .from('certificates')
      .insert({
        user_id,
        event_id: event_id || null,
        certificate_title,
        file_path: fileName,
        uploaded_by: adminId,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Certificate insert error:', insertErr);
      // Cleanup uploaded file
      await supabase.storage.from('certificates').remove([fileName]);
      return res.status(500).json({ success: false, message: 'Failed to save certificate record', data: null });
    }

    return res.json({
      success: true,
      message: `Certificate uploaded for ${targetUser.full_name}`,
      data: cert,
    });
  } catch (err) {
    console.error('uploadCertificate error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/certificates/my
 */
export async function getMyCertificates(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_title,
        issued_at,
        events:event_id (
          id,
          title,
          event_date
        )
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch certificates', data: null });
    }

    return res.json({ success: true, data, message: '' });
  } catch (err) {
    console.error('getMyCertificates error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/certificates/download/:certId
 * Generate signed download URL
 */
export async function downloadCertificate(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { certId } = req.params;

    // Fetch certificate
    const { data: cert, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .single();

    if (error || !cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found', data: null });
    }

    // Access control: user can only download their own (admin can download any)
    if (userRole !== 'admin' && cert.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied', data: null });
    }

    // Generate signed URL (valid 10 minutes)
    const { data: signedData, error: signErr } = await supabase.storage
      .from('certificates')
      .createSignedUrl(cert.file_path, 600);

    if (signErr || !signedData) {
      return res.status(500).json({ success: false, message: 'Failed to generate download link', data: null });
    }

    return res.json({
      success: true,
      data: { download_url: signedData.signedUrl },
      message: '',
    });
  } catch (err) {
    console.error('downloadCertificate error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/certificates/admin/all
 */
export async function getAllCertificates(req: Request, res: Response) {
  try {
    const { event_id } = req.query;

    let query = supabase
      .from('certificates')
      .select(`
        id,
        certificate_title,
        file_path,
        issued_at,
        users:user_id (
          id,
          full_name,
          email,
          avatar_url
        ),
        events:event_id (
          id,
          title
        ),
        uploader:uploaded_by (
          id,
          full_name
        )
      `)
      .order('issued_at', { ascending: false });

    if (event_id) {
      query = query.eq('event_id', event_id as string);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch certificates', data: null });
    }

    return res.json({ success: true, data, message: '' });
  } catch (err) {
    console.error('getAllCertificates error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * DELETE /api/certificates/admin/:certId
 */
export async function deleteCertificate(req: Request, res: Response) {
  try {
    const { certId } = req.params;

    // Get file path first
    const { data: cert } = await supabase
      .from('certificates')
      .select('file_path')
      .eq('id', certId)
      .single();

    if (cert?.file_path) {
      await supabase.storage.from('certificates').remove([cert.file_path]);
    }

    const { error } = await supabase.from('certificates').delete().eq('id', certId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete', data: null });
    }

    return res.json({ success: true, message: 'Certificate deleted', data: null });
  } catch (err) {
    console.error('deleteCertificate error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}
