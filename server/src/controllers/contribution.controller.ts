import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/contributions/admin/requests
 * Admin creates a new contribution request
 */
export async function createRequest(req: Request, res: Response) {
  try {
    const adminId = req.user!.userId;
    const { title, description, amount, event_id } = req.body;
    const file = req.file;

    if (!title || !amount || !file) {
      return res.status(400).json({
        success: false,
        message: 'title, amount, and qr_image are required',
        data: null,
      });
    }

    // Upload QR image to Supabase Storage
    const ext = file.originalname.split('.').pop() || 'png';
    const fileName = `qr/${uuidv4()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('contribution-qr')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadErr) {
      console.error('QR upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'QR image upload failed', data: null });
    }

    // Get public URL (bucket is public)
    const { data: urlData } = supabase.storage
      .from('contribution-qr')
      .getPublicUrl(fileName);

    // Insert request
    const { data: request, error: insertErr } = await supabase
      .from('contribution_requests')
      .insert({
        title,
        description: description || null,
        amount: parseFloat(amount),
        qr_image_path: urlData.publicUrl,
        event_id: event_id || null,
        created_by: adminId,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Request insert error:', insertErr);
      return res.status(500).json({ success: false, message: 'Failed to create request', data: null });
    }

    return res.json({ success: true, data: request, message: 'Contribution request created' });
  } catch (err) {
    console.error('createRequest error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * PUT /api/contributions/admin/requests/:requestId/close
 */
export async function closeRequest(req: Request, res: Response) {
  try {
    const { requestId } = req.params;

    const { error } = await supabase
      .from('contribution_requests')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to close request', data: null });
    }

    return res.json({ success: true, message: 'Request closed', data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/contributions/requests/active
 * Any authenticated user sees active contribution requests
 */
export async function getActiveRequests(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data: requests, error } = await supabase
      .from('contribution_requests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch requests', data: null });
    }

    // For each request, check if user already submitted
    const requestIds = (requests || []).map((r) => r.id);
    const { data: mySubmissions } = await supabase
      .from('contributions')
      .select('request_id, status')
      .eq('user_id', userId)
      .in('request_id', requestIds.length > 0 ? requestIds : ['none']);

    const submissionMap = new Map(
      (mySubmissions || []).map((s) => [s.request_id, s.status])
    );

    const result = (requests || []).map((r) => ({
      ...r,
      my_status: submissionMap.get(r.id) || null,
    }));

    return res.json({ success: true, data: result, message: '' });
  } catch (err) {
    console.error('getActiveRequests error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * POST /api/contributions/submit
 * User submits payment reference
 */
export async function submitContribution(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { request_id, payment_reference, amount } = req.body;

    if (!request_id || !payment_reference) {
      return res.status(400).json({
        success: false,
        message: 'request_id and payment_reference are required',
        data: null,
      });
    }

    // Check request exists and is active
    const { data: request, error: reqErr } = await supabase
      .from('contribution_requests')
      .select('*')
      .eq('id', request_id)
      .eq('status', 'active')
      .single();

    if (reqErr || !request) {
      return res.status(404).json({
        success: false,
        message: 'Contribution request not found or closed',
        data: null,
      });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('contributions')
      .select('id')
      .eq('request_id', request_id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted for this contribution',
        data: null,
      });
    }

    // Insert
    const { data: contribution, error: insertErr } = await supabase
      .from('contributions')
      .insert({
        request_id,
        user_id: userId,
        amount: amount || request.amount,
        payment_reference,
        status: 'pending',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Contribution insert error:', insertErr);
      return res.status(500).json({ success: false, message: 'Failed to submit', data: null });
    }

    return res.json({ success: true, data: contribution, message: 'Payment submitted for verification' });
  } catch (err) {
    console.error('submitContribution error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/contributions/my
 */
export async function getMyContributions(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data, error } = await supabase
      .from('contributions')
      .select(`
        id,
        amount,
        payment_reference,
        status,
        paid_at,
        verified_at,
        contribution_requests:request_id (
          id,
          title,
          amount
        )
      `)
      .eq('user_id', userId)
      .order('paid_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch', data: null });
    }

    return res.json({ success: true, data, message: '' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/contributions/admin/all
 */
export async function getAllContributions(req: Request, res: Response) {
  try {
    const { status, request_id } = req.query;

    let query = supabase
      .from('contributions')
      .select(`
        id,
        amount,
        payment_reference,
        status,
        paid_at,
        verified_at,
        users:user_id (
          id,
          full_name,
          email,
          avatar_url
        ),
        contribution_requests:request_id (
          id,
          title
        )
      `)
      .order('paid_at', { ascending: false });

    if (status) query = query.eq('status', status as string);
    if (request_id) query = query.eq('request_id', request_id as string);

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch', data: null });
    }

    return res.json({ success: true, data, message: '' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * PUT /api/contributions/admin/:contributionId/verify
 * Approve or reject
 */
export async function verifyContribution(req: Request, res: Response) {
  try {
    const adminId = req.user!.userId;
    const { contributionId } = req.params;
    const { action } = req.body; // 'verify' or 'reject'

    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be verify or reject', data: null });
    }

    const newStatus = action === 'verify' ? 'verified' : 'rejected';

    const { data, error } = await supabase
      .from('contributions')
      .update({
        status: newStatus,
        verified_by: adminId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', contributionId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update', data: null });
    }

    return res.json({ success: true, data, message: `Contribution ${newStatus}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}

/**
 * GET /api/contributions/admin/stats
 */
export async function getContributionStats(req: Request, res: Response) {
  try {
    const { count: totalPending } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: totalVerified } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified');

    const { data: sumData } = await supabase
      .from('contributions')
      .select('amount')
      .eq('status', 'verified');

    const totalCollected = (sumData || []).reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return res.json({
      success: true,
      data: {
        total_pending: totalPending || 0,
        total_verified: totalVerified || 0,
        total_collected: totalCollected,
      },
      message: '',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
}
