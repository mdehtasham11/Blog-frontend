import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Footer() {
  const authStatus = useSelector((state) => state.auth.status);
  return (
    <footer className="bg-ink text-ink-faint border-t border-ink-mid">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <span className="font-serif text-lg font-bold text-paper">
            Islam &amp; Science
          </span>

          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-sans uppercase tracking-widest">
            <Link to="/" className="hover:text-paper transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-paper transition-colors">Articles</Link>
            {authStatus && (
              <Link to="/add-post" className="hover:text-paper transition-colors">Write</Link>
            )}
            <Link to="/login" className="hover:text-paper transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-paper transition-colors">Sign Up</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-mid">
          <p className="text-xs font-sans text-ink-faint">
            &copy; {new Date().getFullYear()} Islam &amp; Science. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
