import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>No stats available.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-xl font-bold">{stats.users?.total || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Super Admins</p>
          <p className="text-xl font-bold text-red-600">{stats.users?.superadmins || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Admins</p>
          <p className="text-xl font-bold text-purple-600">{stats.users?.admins || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Regular Users</p>
          <p className="text-xl font-bold text-green-600">{stats.users?.regular || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Total Posts</p>
          <p className="text-xl font-bold">{stats.posts?.total || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Active Posts</p>
          <p className="text-xl font-bold text-green-600">{stats.posts?.active || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
