import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, GraduationCap, BookOpen, Edit3, Save, CheckCircle2,
  CalendarCheck, Github, Linkedin, FileText, X, Camera, ImageIcon, Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import { eventService } from '../services/event.service';
import { teamService } from '../services/team.service';
import { useApi } from '../hooks/useApi';

/* ── Types ── */
interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  batch_year: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  role: string;
  created_at: string;
}

interface RegistrationData {
  id: string;
  event_id: string;
  status: string;
  registered_at: string;
  event: {
    id: string;
    title: string;
    slug: string;
    event_date: string;
    venue: string | null;
    cover_image: string | null;
    status: string;
  };
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  // Fetch profile
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useApi<ProfileData>(
    () => userService.getProfile(),
    []
  );

  // Fetch registrations
  const { data: registrations, isLoading: regsLoading } = useApi<RegistrationData[]>(
    () => eventService.getMyRegistrations(),
    []
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Team avatar state (for members/admins)
  const isMemberOrAdmin = profile?.role === 'member' || profile?.role === 'admin';
  const [teamProfile, setTeamProfile] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamNotFound, setTeamNotFound] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarEditing, setAvatarEditing] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch team profile for members/admins
  useEffect(() => {
    if (!isMemberOrAdmin) return;
    setTeamLoading(true);
    teamService.getMyTeamProfile()
      .then(res => {
        if (res.success) {
          setTeamProfile(res.data);
          setTeamNotFound(false);
        }
      })
      .catch(() => {
        setTeamNotFound(true);
      })
      .finally(() => setTeamLoading(false));
  }, [isMemberOrAdmin]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate type client-side too
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setAvatarError('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File too large. Maximum size is 5 MB.');
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarSave = async () => {
    if (!avatarFile) {
      setAvatarError('Please select an image from your device');
      return;
    }
    try {
      setAvatarSaving(true);
      setAvatarError(null);
      const res = await teamService.updateMyAvatar(avatarFile);
      if (res.success) {
        setTeamProfile(res.data);
        setAvatarEditing(false);
        setAvatarFile(null);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        setAvatarSaved(true);
        setTimeout(() => setAvatarSaved(false), 2500);
      }
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarSaving(false);
    }
  };

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    department: '',
    batch_year: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        department: profile.department || '',
        batch_year: profile.batch_year?.toString() || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name) return;

    try {
      setSaving(true);
      setError(null);

      const updates: Record<string, any> = {};
      if (form.full_name && form.full_name !== profile?.full_name) updates.full_name = form.full_name;
      if (form.bio !== (profile?.bio || '')) updates.bio = form.bio;
      if (form.department !== (profile?.department || '')) updates.department = form.department;
      if (form.batch_year && parseInt(form.batch_year) !== profile?.batch_year) updates.batch_year = parseInt(form.batch_year);
      if (form.github_url !== (profile?.github_url || '')) updates.github_url = form.github_url;
      if (form.linkedin_url !== (profile?.linkedin_url || '')) updates.linkedin_url = form.linkedin_url;
      if (form.portfolio_url !== (profile?.portfolio_url || '')) updates.portfolio_url = form.portfolio_url;

      if (Object.keys(updates).length === 0) {
        setError('No changes detected');
        return;
      }

      await userService.updateProfile(updates);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      refetchProfile();
      // Refresh auth context so Navbar, sidebar, dashboard all get updated data
      refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 40%, #D8CAF6 100%)' }}>
      <div className="container mx-auto max-w-2xl px-4 py-6 md:py-12 lg:py-20">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-[#E0D4F5] object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1A0B2E] flex items-center justify-center mx-auto mb-4">
              <User size={36} className="text-white" />
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A0B2E] tracking-tight">
            {profileLoading ? 'Loading...' : 'Your Profile'}
          </h1>
          <p className="text-[#2D164B] opacity-60 text-sm md:text-base mt-2 font-medium">
            {profile ? 'Manage your details and registrations' : 'Loading your profile...'}
          </p>
          {profile && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <span
                className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(150,103,224,0.15), rgba(75,44,130,0.1))',
                  color: '#9667E0',
                  border: '1px solid rgba(150,103,224,0.3)',
                }}
              >
                {profile.role}
              </span>
              <span className="text-xs text-[#2D164B] opacity-40 font-medium">
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </motion.div>

        {/* ── Loading state ── */}
        {profileLoading && (
          <div className="text-center py-16">
            <div
              className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: '#9667E0', borderTopColor: 'transparent' }}
            />
            <p className="text-sm font-medium text-[#2D164B] opacity-50">Loading profile...</p>
          </div>
        )}

        {/* ── Error state ── */}
        {profileError && !profileLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-sm font-semibold text-red-500">Could not load profile. Please try again.</p>
          </motion.div>
        )}

        {/* ── Profile Card ── */}
        {profile && !profileLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E0D4F5] shadow-sm p-6 md:p-10"
          >
            {editing ? (
              <form onSubmit={handleSave} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mb-1.5 block">Full Name *</label>
                  <div className="flex items-center border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <User size={16} className="text-[#9667E0] mr-3 shrink-0" />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => handleChange('full_name', e.target.value)}
                      placeholder="Your full name"
                      required
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] placeholder:text-[#B8A5D4]"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mb-1.5 block">Bio</label>
                  <div className="flex items-start border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <FileText size={16} className="text-[#9667E0] mr-3 shrink-0 mt-0.5" />
                    <textarea
                      value={form.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] placeholder:text-[#B8A5D4] resize-none"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mb-1.5 block">Department</label>
                  <div className="flex items-center border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <BookOpen size={16} className="text-[#9667E0] mr-3 shrink-0" />
                    <select
                      value={form.department}
                      onChange={e => handleChange('department', e.target.value)}
                      title="Department"
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] bg-transparent cursor-pointer"
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Batch Year */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mb-1.5 block">Batch Year</label>
                  <div className="flex items-center border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <GraduationCap size={16} className="text-[#9667E0] mr-3 shrink-0" />
                    <input
                      type="number"
                      value={form.batch_year}
                      onChange={e => handleChange('batch_year', e.target.value)}
                      placeholder="e.g. 2025"
                      min="2000"
                      max="2035"
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] placeholder:text-[#B8A5D4]"
                    />
                  </div>
                </div>

                {/* GitHub */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mb-1.5 block">GitHub URL</label>
                  <div className="flex items-center border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <Github size={16} className="text-[#9667E0] mr-3 shrink-0" />
                    <input
                      type="url"
                      value={form.github_url}
                      onChange={e => handleChange('github_url', e.target.value)}
                      placeholder="https://github.com/username"
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] placeholder:text-[#B8A5D4]"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mb-1.5 block">LinkedIn URL</label>
                  <div className="flex items-center border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <Linkedin size={16} className="text-[#9667E0] mr-3 shrink-0" />
                    <input
                      type="url"
                      value={form.linkedin_url}
                      onChange={e => handleChange('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] placeholder:text-[#B8A5D4]"
                    />
                  </div>
                </div>

                {/* Portfolio URL */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9667E0]">Portfolio URL</label>
                  </div>
                  <div className="flex items-center border border-[#E0D4F5] rounded-xl px-4 py-3 focus-within:border-[#9667E0] transition-colors">
                    <FileText size={16} className="text-[#9667E0] mr-3 shrink-0" />
                    <input
                      type="url"
                      value={form.portfolio_url}
                      onChange={e => handleChange('portfolio_url', e.target.value)}
                      placeholder="https://your-portfolio.com"
                      className="flex-1 outline-none text-sm font-semibold text-[#1A0B2E] placeholder:text-[#B8A5D4]"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setError(null); }}
                    className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
                    style={{ background: '#EEEAFD', color: '#4B2C82', border: '1px solid #D8CAF6' }}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3.5 bg-[#1A0B2E] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#4B2C82] transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }} />
                        Saving...
                      </>
                    ) : (
                      <><Save size={16} /> Save Profile</>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* Display mode */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-[#1A0B2E]">Profile Details</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#9667E0] hover:text-[#1A0B2E] transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: User, label: 'Name', value: profile.full_name },
                    { icon: Mail, label: 'Email', value: profile.email },
                    { icon: FileText, label: 'Bio', value: profile.bio || '—' },
                    { icon: BookOpen, label: 'Department', value: profile.department || '—' },
                    { icon: GraduationCap, label: 'Batch Year', value: profile.batch_year?.toString() || '—' },
                    { icon: Github, label: 'GitHub', value: profile.github_url, isLink: true },
                    { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin_url, isLink: true },
                    { icon: FileText, label: 'Portfolio', value: profile.portfolio_url, isLink: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-[#F0EBF9] last:border-0">
                      <row.icon size={16} className="text-[#9667E0] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9667E0] block">{row.label}</span>
                        {(row as any).isLink && row.value ? (
                          <a
                            href={row.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-[#4B2C82] hover:text-[#9667E0] transition-colors underline underline-offset-2 truncate block"
                          >
                            {row.value}
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-[#1A0B2E]">{row.value || '—'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved toast */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
              >
                <CheckCircle2 size={16} /> Profile saved successfully!
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Team Profile Photo (members/admins only) ── */}
        {profile && isMemberOrAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 bg-white rounded-2xl border border-[#E0D4F5] shadow-sm p-6 md:p-10"
          >
            <h2 className="text-lg font-extrabold text-[#1A0B2E] mb-4 flex items-center gap-2">
              <Camera size={18} className="text-[#9667E0]" /> About Page Photo
            </h2>
            <p className="text-xs text-[#2D164B] opacity-50 mb-5 font-medium">
              This photo appears on the <span className="text-[#9667E0] font-bold">About</span> page next to your name.
            </p>

            {teamLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-6 h-6 border-3 rounded-full animate-spin" style={{ borderColor: '#D8CAF6', borderTopColor: '#9667E0' }} />
                <span className="text-sm font-medium text-[#2D164B] opacity-50">Looking for your team profile...</span>
              </div>
            ) : teamNotFound ? (
              <div className="py-4 px-5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700 font-medium">
                  No team profile is linked to your email yet. Ask an admin to set your email (<strong>{profile.email}</strong>) in the team members list.
                </p>
              </div>
            ) : teamProfile ? (
              <div>
                {/* Current Photo Preview */}
                <div className="flex items-start gap-5 mb-5">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#E0D4F5] bg-[#EEEAFD] shrink-0">
                    <img
                      src={teamProfile.avatar_url || `https://picsum.photos/seed/${teamProfile.img_seed || teamProfile.name}/200`}
                      alt={teamProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1A0B2E]">{teamProfile.name}</p>
                    <p className="text-xs text-[#9667E0] font-semibold uppercase tracking-wider">{teamProfile.role}</p>
                    <p className="text-[10px] text-[#2D164B] opacity-40 font-mono mt-1">{teamProfile.department} · {teamProfile.tier}</p>
                    <span
                      className="inline-block mt-2 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
                      style={{
                        background: teamProfile.avatar_url
                          ? 'rgba(16,163,127,0.1)'
                          : 'rgba(234,179,8,0.1)',
                        color: teamProfile.avatar_url ? '#059669' : '#B45309',
                        border: `1px solid ${teamProfile.avatar_url ? 'rgba(5,150,105,0.3)' : 'rgba(234,179,8,0.3)'}`,
                      }}
                    >
                      {teamProfile.avatar_url ? 'Custom Photo' : 'Using Placeholder'}
                    </span>
                  </div>
                </div>

                {/* Avatar File Uploader */}
                {avatarEditing ? (
                  <div className="space-y-3">
                    {/* Hidden native file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {/* Upload trigger area */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-[#D8CAF6] rounded-xl hover:border-[#9667E0] hover:bg-[#FAF9FE] transition-all cursor-pointer"
                    >
                      <Upload size={28} className="text-[#9667E0]" />
                      <span className="text-sm font-bold text-[#2D164B]">
                        {avatarFile ? 'Tap to change image' : 'Choose a photo from your device'}
                      </span>
                      <span className="text-[10px] text-[#2D164B] opacity-40 font-medium">
                        JPEG, PNG, WebP, or GIF · max 5 MB
                      </span>
                    </button>

                    {/* Local Preview */}
                    {avatarPreview && (
                      <div className="flex items-center gap-3 p-3 bg-[#FAF9FE] rounded-xl border border-[#E0D4F5]">
                        <ImageIcon size={14} className="text-[#9667E0] shrink-0" />
                        <span className="text-[10px] font-semibold text-[#2D164B] opacity-60">Preview:</span>
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#E0D4F5]">
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-[#2D164B] opacity-40 font-mono truncate">
                          {avatarFile?.name}
                        </span>
                      </div>
                    )}

                    {avatarError && (
                      <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                        {avatarError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarEditing(false);
                          setAvatarError(null);
                          setAvatarFile(null);
                          if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                          setAvatarPreview(null);
                        }}
                        className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                        style={{ background: '#EEEAFD', color: '#4B2C82', border: '1px solid #D8CAF6' }}
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAvatarSave}
                        disabled={avatarSaving || !avatarFile}
                        className="flex-1 py-3 bg-[#1A0B2E] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#4B2C82] transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {avatarSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#FFF', borderTopColor: 'transparent' }} />
                            Uploading...
                          </>
                        ) : (
                          <><Upload size={14} /> Upload Photo</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAvatarEditing(true)}
                    className="flex items-center gap-2 text-xs font-bold text-[#9667E0] hover:text-[#1A0B2E] transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    <Edit3 size={14} /> Change Photo
                  </button>
                )}

                {avatarSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                  >
                    <CheckCircle2 size={16} /> About page photo updated!
                  </motion.div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ── Registered Events ── */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-2xl border border-[#E0D4F5] shadow-sm p-6 md:p-10"
          >
            <h2 className="text-lg font-extrabold text-[#1A0B2E] mb-4 flex items-center gap-2">
              <CalendarCheck size={18} className="text-[#9667E0]" /> Registered Events
            </h2>

            {regsLoading ? (
              <div className="flex items-center gap-3 py-6">
                <div
                  className="w-6 h-6 border-3 rounded-full animate-spin"
                  style={{ borderColor: '#D8CAF6', borderTopColor: '#9667E0' }}
                />
                <span className="text-sm font-medium text-[#2D164B] opacity-50">Loading registrations...</span>
              </div>
            ) : !registrations || registrations.length === 0 ? (
              <p className="text-sm text-[#2D164B] opacity-50 font-medium">You haven't registered for any events yet.</p>
            ) : (
              <div className="space-y-3">
                {registrations.map(reg => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(`/events/${reg.event.slug}/register`)}
                    className="flex items-center gap-4 py-3 px-4 bg-[#FAF9FE] rounded-xl border border-[#E0D4F5] cursor-pointer hover:border-[#9667E0] transition-colors group"
                  >
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-[#1A0B2E] group-hover:text-[#4B2C82] transition-colors">
                        {reg.event.title}
                      </span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] font-semibold text-[#9667E0] uppercase tracking-wider">
                          {new Date(reg.event.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {reg.event.venue && (
                          <span className="text-[10px] font-medium text-[#2D164B] opacity-40">
                            📍 {reg.event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        background: (reg.event.status === 'upcoming' || reg.event.status === 'ongoing')
                          ? 'rgba(16,163,127,0.1)'
                          : reg.event.status === 'completed'
                            ? 'rgba(150,103,224,0.1)'
                            : 'rgba(220,38,38,0.1)',
                        color: (reg.event.status === 'upcoming' || reg.event.status === 'ongoing')
                          ? '#059669'
                          : reg.event.status === 'completed'
                            ? '#9667E0'
                            : '#DC2626',
                        border: `1px solid ${(reg.event.status === 'upcoming' || reg.event.status === 'ongoing')
                          ? 'rgba(5,150,105,0.3)'
                          : reg.event.status === 'completed'
                            ? 'rgba(150,103,224,0.3)'
                            : 'rgba(220,38,38,0.3)'}`,
                      }}
                    >
                      {reg.event.status === 'upcoming' ? 'Upcoming' : reg.event.status === 'ongoing' ? 'Ongoing' : reg.event.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
