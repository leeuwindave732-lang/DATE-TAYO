import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

interface Props {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        fetchUser();
    }, []);

    if (loading) return <p>Loading...</p>; // optional loader

    if (!user) return <Navigate to="/auth" replace />;

    return children;
};

export default ProtectedRoute;
