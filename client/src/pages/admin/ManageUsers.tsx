import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/admin.service';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, refetch } = useApi<any[]>(
    () => adminService.getAllUsers()
  );
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [roleChange, setRoleChange] = useState<{
    userId: string;
    name: string;
    newRole: string;
  } | null>(null);
  const [statusChange, setStatusChange] = useState<{
    userId: string;
    name: string;
    isActive: boolean;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleRoleChange = async () => {
    if (!roleChange) return;
    try {
      setProcessing(true);
      await adminService.updateRole(roleChange.userId, roleChange.newRole);
      setMessage({
        type: 'success',
        text: `${roleChange.name}'s role updated to ${roleChange.newRole}`,
      });
      setRoleChange(null);
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update role',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusChange) return;
    try {
      setProcessing(true);
      await adminService.toggleStatus(statusChange.userId, statusChange.isActive);
      setMessage({
        type: 'success',
        text: `${statusChange.name} ${statusChange.isActive ? 'activated' : 'deactivated'}`,
      });
      setStatusChange(null);
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update status',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#1A0B2E] mb-6">Manage Users</h1>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E0D4F5] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0D4F5] bg-[#EEEAFD]/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D4F5]/30">
            {users?.map((u: any) => {
              const isSelf = u.id === currentUser?.id;

              return (
                <tr key={u.id} className={`hover:bg-[#EEEAFD]/30 ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar_url || '/default-avatar.png'}
                        alt={u.full_name}
                        className="w-8 h-8 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-medium text-[#2D164B]">
                        {u.full_name}
                        {isSelf && (
                          <span className="text-xs text-[#9667E0]/40 ml-1">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#2D164B]/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        u.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    {u.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-4 py-3 text-[#2D164B]/50">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex gap-2">
                        {/* Role Dropdown */}
                        <select
                          value={u.role}
                          onChange={(e) =>
                            setRoleChange({
                              userId: u.id,
                              name: u.full_name,
                              newRole: e.target.value,
                            })
                          }
                          className="text-xs border border-[#D8CAF6] rounded-xl px-2 py-1.5 bg-white"
                          title="Change user role"
                        >
                          <option value="student">Student</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Toggle Active */}
                        <button
                          onClick={() =>
                            setStatusChange({
                              userId: u.id,
                              name: u.full_name,
                              isActive: !u.is_active,
                            })
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg ${
                            u.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Change Confirm */}
      <ConfirmDialog
        isOpen={!!roleChange}
        onClose={() => setRoleChange(null)}
        onConfirm={handleRoleChange}
        title="Change User Role"
        message={`Change ${roleChange?.name}'s role to "${roleChange?.newRole}"?`}
        confirmLabel="Update Role"
        confirmColor="blue"
        isLoading={processing}
      />

      {/* Status Change Confirm */}
      <ConfirmDialog
        isOpen={!!statusChange}
        onClose={() => setStatusChange(null)}
        onConfirm={handleStatusChange}
        title={statusChange?.isActive ? 'Activate User' : 'Deactivate User'}
        message={`Are you sure you want to ${statusChange?.isActive ? 'activate' : 'deactivate'} ${statusChange?.name}?`}
        confirmLabel={statusChange?.isActive ? 'Activate' : 'Deactivate'}
        confirmColor={statusChange?.isActive ? 'green' : 'red'}
        isLoading={processing}
      />
    </div>
  );
}

