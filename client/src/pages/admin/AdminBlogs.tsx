import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { blogService } from '../../services/blog.service';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminBlogs() {
  const { data: blogs, isLoading, refetch } = useApi<any[]>(
    () => blogService.getAll()
  );
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [actionBlog, setActionBlog] = useState<{ id: string; title: string; action: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const performAction = async () => {
    if (!actionBlog) return;
    try {
      setProcessing(true);
      switch (actionBlog.action) {
        case 'publish':
          await blogService.publish(actionBlog.id);
          break;
        case 'unpublish':
          await blogService.unpublish(actionBlog.id);
          break;
        case 'delete':
          await blogService.deleteBlog(actionBlog.id);
          break;
      }
      setMessage({
        type: 'success',
        text: `Blog "${actionBlog.title}" ${actionBlog.action}ed`,
      });
      setActionBlog(null);
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading blogs..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#1A0B2E] mb-6">All Blogs</h1>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {blogs?.map((blog: any) => (
          <div key={blog.id} className="bg-white rounded-2xl border border-[#E0D4F5] p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#1A0B2E]">{blog.title}</h3>
                  <StatusBadge status={blog.status} />
                </div>
                <p className="text-sm text-[#2D164B]/70 mb-2 line-clamp-1">
                  {blog.excerpt || blog.content?.substring(0, 100)}
                </p>
                <p className="text-xs text-[#2D164B]/50">
                  By: {blog.author?.full_name} •{' '}
                  {new Date(blog.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.status === 'draft' && (
                  <button
                    onClick={() => setActionBlog({ id: blog.id, title: blog.title, action: 'publish' })}
                    className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    Publish
                  </button>
                )}
                {blog.status === 'published' && (
                  <button
                    onClick={() => setActionBlog({ id: blog.id, title: blog.title, action: 'unpublish' })}
                    className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
                  >
                    Unpublish
                  </button>
                )}
                <button
                  onClick={() => setActionBlog({ id: blog.id, title: blog.title, action: 'delete' })}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!actionBlog}
        onClose={() => setActionBlog(null)}
        onConfirm={performAction}
        title={`${actionBlog?.action?.charAt(0).toUpperCase()}${actionBlog?.action?.slice(1)} Blog`}
        message={`${actionBlog?.action} "${actionBlog?.title}"?`}
        confirmLabel={actionBlog?.action || ''}
        confirmColor={actionBlog?.action === 'delete' ? 'red' : 'green'}
        isLoading={processing}
      />
    </div>
  );
}

