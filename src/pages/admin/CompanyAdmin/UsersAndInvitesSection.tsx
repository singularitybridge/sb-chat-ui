import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../store/common/RootStoreContext';
import { ICompany } from '../../../store/models/Company';
import { IUser } from '../../../store/models/User';
import { toJS } from 'mobx';
import { Table } from '../../../components/sb-core-ui-kit/Table';
import { convertToStringArray } from '../../../utils/utils';
import { TrashIcon, UserPlus, Mail, XCircle, Trash2 } from 'lucide-react';
import { IconButton } from '../../../components/admin/IconButton';
import { emitter } from '../../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../../utils/eventNames';
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

const UsersAndInvitesSection: React.FC<UsersAndInvitesSectionProps> = observer(
  ({ company }) => {
    const rootStore = useRootStore();
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
      rootStore.deleteUser(row._id);
    };

    const handleSetUser = async (row: IUser) => {
      emitter.emit(EVENT_SHOW_NOTIFICATION, 'User set successfully');
    };

    const handleCreateInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail) {
        emitter.emit(EVENT_SHOW_NOTIFICATION, 'Email is required');
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.post('/api/invites', {
          email: inviteEmail,
          name: inviteName || undefined,
          role: 'CompanyUser',
        });

        console.log('Invite created:', response.data);

        emitter.emit(EVENT_SHOW_NOTIFICATION, 'Invite sent successfully');
        setInviteEmail('');
        setInviteName('');
        setShowInviteForm(false);

        // Refresh invites list
        console.log('Refreshing invites after create...');
        await fetchInvites();
      } catch (error: any) {
        console.error('Failed to create invite - Full error:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);

        const message = error.response?.data?.error || error.message || 'Failed to send invite';
        emitter.emit(EVENT_SHOW_NOTIFICATION, message);
      } finally {
        setIsLoading(false);
      }
    };

    const handleRevokeInvite = async (inviteId: string) => {
      if (!confirm('Are you sure you want to revoke this invite?')) {
        return;
      }

      try {
        const response = await apiClient.delete(`/api/invites/${inviteId}/revoke`);
        console.log('Invite revoked:', response.data);

        emitter.emit(EVENT_SHOW_NOTIFICATION, 'Invite revoked successfully');

        // Refresh invites list
        console.log('Refreshing invites after revoke...');
        await fetchInvites();
      } catch (error: any) {
        console.error('Failed to revoke invite - Full error:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);

        const message = error.response?.data?.error || error.message || 'Failed to revoke invite';
        emitter.emit(EVENT_SHOW_NOTIFICATION, message);
      }
    };

    const handleDeleteInvite = async (inviteId: string) => {
      if (!confirm('Are you sure you want to permanently delete this invite? This action cannot be undone.')) {
        return;
      }

      try {
        const response = await apiClient.delete(`/api/invites/${inviteId}`);
        console.log('Invite deleted:', response.data);

        emitter.emit(EVENT_SHOW_NOTIFICATION, 'Invite deleted successfully');

        // Refresh invites list
        console.log('Refreshing invites after delete...');
        await fetchInvites();
      } catch (error: any) {
        console.error('Failed to delete invite - Full error:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);

        const message = error.response?.data?.error || error.message || 'Failed to delete invite';
        emitter.emit(EVENT_SHOW_NOTIFICATION, message);
      }
    };

    const userHeaders = ['name', 'nickname', 'email'];
    const UserActions = (row: IUser) => (
      <div className="flex space-x-3 items-center mx-1 rtl:space-x-reverse">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center justify-center rounded-md hover:bg-gray-100 p-2 transition-colors"
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
          <p className="text-gray-600 mb-6">
            Manage users in your organization
          </p>
          <Table
            headers={convertToStringArray(userHeaders)}
            data={toJS(rootStore.users)}
            Page="UsersPage"
            onRowClick={(row: IUser) => {}}
            Actions={UserActions}
          />
        </div>

        {/* Invites Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Invites</h2>
              <p className="text-sm text-gray-600 mt-1">
                Invite colleagues to join your company
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="pending">Pending Only</option>
                <option value="all">All Invites</option>
                <option value="accepted">Accepted</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Send Invite
              </button>
            </div>
          </div>

          {/* Invite Form */}
          {showInviteForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invites.map((invite) => (
                    <tr key={invite._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invite.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invite.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invite.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : invite.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending invites</p>
              <p className="text-sm mt-1">
                Click "Send Invite" to invite team members
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export { UsersAndInvitesSection };
