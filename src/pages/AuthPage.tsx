import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Input from "../components/input";
import Button from "../components/Button";

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Listen to auth changes
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) navigate("/profile"); // redirect after login
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [navigate]);

    const handleAuth = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // Auth state listener will handle redirect
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Signup successful! Please check your email to confirm your account.");
                setIsLogin(true);
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
            <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-center">{isLogin ? "Login" : "Sign Up"}</h1>

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-2"
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-2"
                />

                <Button label={loading ? "Processing..." : isLogin ? "Login" : "Sign Up"} fullWidth onClick={handleAuth} disabled={loading} />

                <p className="text-center text-sm text-gray-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button className="text-blue-500 font-semibold" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
