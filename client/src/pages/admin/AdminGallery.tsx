import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { galleryService } from '../../services/gallery.service';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminGallery() {
  const { data: items, isLoading, refetch } = useApi<any[]>(
    () => galleryService.getAll() as any
  );
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const filterLabels: Record<string, string> = {
    all: 'All',
    draft: 'Pending',
    published: 'Approved',
    archived: 'Rejected',
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      setProcessing(id);
      switch (action) {
        case 'approve':
          await galleryService.approve(id);
          break;
        case 'reject':
          await galleryService.reject(id);
          break;
        case 'delete':
          if (!window.confirm('Are you sure you want to permanently delete this photo?')) {
            setProcessing(null);
            return;
          }
          await galleryService.deleteItem(id);
          break;
      }
      setMessage({ type: 'success', text: `Item ${action}d` });
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally {
      setProcessing(null);
    }
  };

  // ── Approve All pending items ──
  const handleApproveAll = async () => {
    if (selectionMode) return; // Blocked while in selection mode
    const pendingIds = (items || [])
      .filter((i: any) => i.status === 'draft')
      .map((i: any) => i.id);

    if (pendingIds.length === 0) {
      setMessage({ type: 'error', text: 'No pending items to approve' });
      return;
    }

    try {
      setBulkProcessing(true);
      const res = await galleryService.bulkApprove(pendingIds);
      setMessage({ type: 'success', text: res.message || `${pendingIds.length} items approved` });
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Bulk approve failed' });
    } finally {
      setBulkProcessing(false);
    }
  };

  // ── Approve selected items ──
  const handleApproveSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setMessage({ type: 'error', text: 'No items selected' });
      return;
    }

    try {
      setBulkProcessing(true);
      const res = await galleryService.bulkApprove(ids);
      setMessage({ type: 'success', text: res.message || `${ids.length} items approved` });
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Approve selected failed' });
    } finally {
      setBulkProcessing(false);
    }
  };

  // ── Delete selected items ──
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setMessage({ type: 'error', text: 'No items selected' });
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} selected photos?`)) {
      return;
    }

    try {
      setBulkProcessing(true);
      await Promise.all(ids.map(id => galleryService.deleteItem(id)));
      setMessage({ type: 'success', text: `${ids.length} items permanently deleted` });
      setSelectedIds(new Set());
      setSelectionMode(false);
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Delete selected failed' });
    } finally {
      setBulkProcessing(false);
    }
  };

  // ── Toggle selection of a single item ──
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Exit selection mode ──
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  if (isLoading) return <LoadingSpinner message="Loading gallery..." />;

  const filtered = items?.filter((item: any) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const pendingCount = items?.filter((i: any) => i.status === 'draft').length || 0;

  const getParentTitle = (parentId: string) => {
    const parent = items?.find((i: any) => i.id === parentId);
    return parent?.title || 'Untitled Cover';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A0B2E]">Gallery Management</h1>
          <p className="text-sm text-[#2D164B]/60">{pendingCount} items pending review</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'published', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg ${
                filter === f
                  ? 'bg-[#9667E0] text-white'
                  : 'bg-[#EEEAFD] text-[#2D164B] hover:bg-[#D8CAF6]'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[#EEEAFD]/60 rounded-xl border border-[#D8CAF6]/50">
          {/* Approve All — disabled in selection mode */}
          <button
            onClick={handleApproveAll}
            disabled={bulkProcessing || selectionMode}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              selectionMode
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50`}
          >
            {bulkProcessing && !selectionMode ? 'Approving...' : `✅ Approve All (${pendingCount})`}
          </button>

          {/* Select Mode toggle */}
          {!selectionMode ? (
            <button
              onClick={() => setSelectionMode(true)}
              disabled={bulkProcessing || (items || []).length === 0}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#9667E0] text-white hover:bg-[#4B2C82] disabled:opacity-50"
            >
              ☑️ Select Multiple
            </button>
          ) : (
            <>
              <button
                onClick={handleApproveSelected}
                disabled={bulkProcessing || selectedIds.size === 0}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {bulkProcessing ? 'Processing...' : `Approve (${selectedIds.size})`}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={bulkProcessing || selectedIds.size === 0}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {bulkProcessing ? 'Processing...' : `Delete (${selectedIds.size})`}
              </button>
              <button
                onClick={exitSelectionMode}
                disabled={bulkProcessing}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
              >
                ✕ Deselect All
              </button>
              <span className="text-[10px] text-[#2D164B]/50 italic ml-1">
                Click photos to select them
              </span>
            </>
          )}
        </div>
      )}

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered?.map((item: any) => {
          const isSelected = selectedIds.has(item.id);
          const isDraft = item.status === 'draft';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (selectionMode) toggleSelect(item.id);
              }}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                selectionMode ? 'cursor-pointer' : ''
              } ${
                isSelected
                  ? 'border-green-400 ring-2 ring-green-300 shadow-lg'
                  : 'border-[#E0D4F5]'
              }`}
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={item.image_url}
                  alt={item.title || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Selection checkbox overlay */}
                {selectionMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                        isSelected
                          ? 'bg-green-500 text-white'
                          : 'bg-white/80 text-gray-400 border-2 border-gray-300'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                )}
                {/* Badge: Cover vs Sub-photo */}
                <div className="absolute top-2 left-2">
                  {item.parent_id ? (
                    <span className="text-[9px] font-bold bg-blue-500/90 text-white px-2 py-0.5 rounded-full">
                      Sub-photo
                    </span>
                  ) : item.is_cover ? (
                    <span className="text-[9px] font-bold bg-purple-500/90 text-white px-2 py-0.5 rounded-full">
                      Cover
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="p-3">
                {item.title && (
                  <p className="text-sm font-medium text-[#2D164B] truncate">{item.title}</p>
                )}
                {item.parent_id && (
                  <p className="text-[10px] text-blue-500 truncate mt-0.5">
                    ↳ {getParentTitle(item.parent_id)}
                  </p>
                )}
                <p className="text-xs text-[#2D164B]/50 mt-1">
                  By: {item.uploader?.full_name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={item.status} />
                </div>
                {/* Per-item actions — hidden in selection mode */}
                {!selectionMode && (
                  <div className="flex gap-1 mt-3">
                    {isDraft && (
                      <>
                        <button
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={processing === item.id}
                          className="flex-1 text-xs px-2 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'reject')}
                          disabled={processing === item.id}
                          className="flex-1 text-xs px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleAction(item.id, 'delete')}
                      disabled={processing === item.id}
                      className="text-xs px-2 py-1.5 bg-[#EEEAFD] text-[#2D164B] rounded-lg hover:bg-[#D8CAF6] disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
