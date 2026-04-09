import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import authService from '../../services/auth';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUserId(user._id);
        setIsSuperAdmin(user.role === 'superadmin');
      }
    } catch (err) {
      console.error('Failed to get current user', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to update user role', err);
      alert('Failed to update user role');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminService.blockUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to block user', err);
      alert('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminService.unblockUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to unblock user', err);
      alert('Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await adminService.deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id || user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user._id === currentUserId ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'superadmin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role === 'superadmin' ? 'Super Admin (You)' : 'Admin (You)'}
                      </span>
                    ) : isSuperAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-md border-2 transition-colors ${
                          user.role === 'superadmin'
                            ? 'border-red-200 bg-red-50 text-red-800 hover:border-red-300'
                            : user.role === 'admin' 
                            ? 'border-purple-200 bg-purple-50 text-purple-800 hover:border-purple-300' 
                            : 'border-green-200 bg-green-50 text-green-800 hover:border-green-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'superadmin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.status === 'blocked' ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {user.status === 'blocked' ? (
                        <button
                          onClick={() => handleUnblockUser(user._id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user._id)}
                          className={`transition-colors ${
                            user._id === currentUserId
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-yellow-600 hover:text-yellow-900'
                          }`}
                          disabled={user._id === currentUserId}
                          title={user._id === currentUserId ? 'You cannot block yourself' : 'Block user'}
                        >
                          Block
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className={`transition-colors ${
                          user._id === currentUserId
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        disabled={user._id === currentUserId}
                        title={user._id === currentUserId ? 'You cannot delete yourself' : 'Delete user'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;

