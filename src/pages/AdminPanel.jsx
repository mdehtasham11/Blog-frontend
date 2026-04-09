import React, { useState } from 'react';
import Sidebar from '../components/admin/Sidebar';
import Dashboard from '../components/admin/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import PostManagement from '../components/admin/PostManagement';

function AdminPanel() {
    const [activeSection, setActiveSection] = useState('dashboard');

    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard />;
            case 'users':
                return <UserManagement />;
            case 'posts':
                return <PostManagement />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="flex">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
                <main className="flex-1 p-8">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}

export default AdminPanel;
