import React from 'react';

function Sidebar({ activeSection, setActiveSection }) {
    const sections = [
        { name: 'dashboard', label: 'Dashboard' },
        { name: 'users', label: 'Users' },
        { name: 'posts', label: 'Posts' },
    ];

    return (
        <aside className="w-56 bg-ink h-screen p-4 flex-shrink-0">
            <h2 className="font-serif text-base font-bold text-paper mb-6 pb-4 border-b border-ink-mid">
                Admin Panel
            </h2>
            <nav className="space-y-1">
                {sections.map((sec) => (
                    <button
                        key={sec.name}
                        onClick={() => setActiveSection(sec.name)}
                        className={`block w-full text-left py-2.5 px-3 text-sm font-sans uppercase tracking-widest transition-colors min-h-[44px] ${
                            activeSection === sec.name
                                ? 'text-paper bg-ink-mid'
                                : 'text-ink-faint hover:text-paper hover:bg-ink-mid'
                        }`}
                    >
                        {sec.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
