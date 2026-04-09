import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const authStatus = useSelector((state) => state.auth.status);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        if (!authStatus) {
            navigate("/login");
            return;
        }
        const isAdmin = userData?.role === "admin" || userData?.role === "superadmin";
        if (!isAdmin) navigate("/");
        setLoader(false);
    }, [authStatus, userData, navigate]);

    return loader ? (
        <div className="flex justify-center items-center min-h-screen bg-paper">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ink"></div>
        </div>
    ) : <>{children}</>;
}
