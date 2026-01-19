import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../../store/useUserStore';
import { ICompany, IUser } from '../../../types/entities';
import { Table } from '../../../components/sb-core-ui-kit/Table';
import { convertToStringArray } from '../../../utils/utils';
import { TrashIcon, UserPlus, Mail, XCircle, Trash2 } from 'lucide-react';
import apiClient from '../../../services/AxiosService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';

interface Invite {
  _id: string;
  email: string;
  name?: string;
  status: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

interface UsersAndInvitesSectionProps {
  company: ICompany;
}

const UsersAndInvitesSection: React.FC<UsersAndInvitesSectionProps> = (
  { company }
) => {
  const { t } = useTranslation();
  const { users, deleteUser } = useUserStore();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending'); // Default to pending only

    const fetchInvites = async () => {
      try {
        console.log('[fetchInvites] Fetching invites from API...');
        const params = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
        const response = await apiClient.get(`/api/invites${params}`, {
          cache: false, // Disable caching for invites
        });
        console.log('[fetchInvites] Received invites count:', response.data.invites?.length || 0);
        console.log('[fetchInvites] Invites data:', response.data.invites);
        setInvites(response.data.invites || []);
        console.log('[fetchInvites] State updated with invites');
      } catch (error) {
        console.error('[fetchInvites] Failed to fetch invites:', error);
      }
    };

    useEffect(() => {
      fetchInvites();
    }, [statusFilter]);

  const handleDeleteUser = (row: IUser) => {
    deleteUser(row._id);
  };

  const handleSetUser = async (_row: IUser) => {
    toast.success(t('invites.userSetSuccess'));
  };

    const handleCreateInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail) {
        toast.error(t('invites.emailRequired'));
        return;
      }

      setIsLoading(true);
      try {
        await apiClient.post('/api/invites', {
          email: inviteEmail,
          name: inviteName || undefined,
          role: 'CompanyUser',
        });

        toast.success(t('invites.sendSuccess'));
        setInviteEmail('');
        setInviteName('');
        setShowInviteForm(false);

        // Refresh invites list
        await fetchInvites();
      } catch (error: any) {
        const message = error.response?.data?.error || t('invites.sendError');
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    const handleRevokeInvite = async (inviteId: string) => {
      if (!confirm(t('invites.revokeConfirm'))) {
        return;
      }

      try {
        await apiClient.delete(`/api/invites/${inviteId}/revoke`);
        toast.success(t('invites.revokeSuccess'));

        // Refresh invites list
        await fetchInvites();
      } catch (error: any) {
        const message = error.response?.data?.error || t('invites.revokeError');
        toast.error(message);
      }
    };

    const handleDeleteInvite = async (inviteId: string) => {
      if (!confirm(t('invites.deleteConfirm'))) {
        return;
      }

      try {
        await apiClient.delete(`/api/invites/${inviteId}`);
        toast.success(t('invites.deleteSuccess'));

        // Refresh invites list
        await fetchInvites();
      } catch (error: any) {
        const message = error.response?.data?.error || t('invites.deleteError');
        toast.error(message);
      }
    };

    const userHeaders = ['name', 'nickname', 'email'];
    const UserActions = (row: IUser) => (
      <div className="flex space-x-3 items-center mx-1 rtl:space-x-reverse">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center justify-center rounded-md hover:bg-accent p-2 transition-colors"
            >
              <TrashIcon className="w-5 h-5 text-red-600" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{row.name}</strong> ({row.email})?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteUser(row)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );

    return (
      <div className="space-y-8">
        {/* Users Section */}
        <div>
          <h1 className="text-2xl font-semibold mb-2">Users</h1>
          <p className="text-muted-foreground mb-6">
            Manage users in your organization
          </p>
          <Table
            headers={convertToStringArray(userHeaders)}
            data={users}
            Page="UsersPage"
            onRowClick={(_row: IUser) => {}}
            Actions={UserActions}
          />
        </div>

        {/* Invites Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Invites</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Invite colleagues to join your company
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md focus:outline-hidden focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="pending">Pending Only</option>
                <option value="all">All Invites</option>
                <option value="accepted">Accepted</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Send Invite
              </button>
            </div>
          </div>

          {/* Invite Form */}
          {showInviteForm && (
            <div className="bg-secondary p-6 rounded-lg mb-6">
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-hidden focus:ring-2 focus:ring-ring"
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-hidden focus:ring-2 focus:ring-ring"
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 bg-accent text-foreground rounded-md hover:bg-accent/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Invites Table */}
          {invites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {invites.map((invite) => (
                    <tr key={invite._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {invite.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {invite.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invite.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : invite.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-secondary text-foreground'
                          }`}
                        >
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          {invite.status === 'pending' && (
                            <button
                              onClick={() => handleRevokeInvite(invite._id)}
                              className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvite(invite._id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending invites</p>
              <p className="text-sm mt-1">
                Click &quot;Send Invite&quot; to invite team members
              </p>
            </div>
          )}
        </div>
      </div>
    );
};

export { UsersAndInvitesSection };
