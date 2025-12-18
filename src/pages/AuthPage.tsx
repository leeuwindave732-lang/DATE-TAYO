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
            if (session?.user) navigate("/profile");
        });

        return () => listener.subscription.unsubscribe();
    }, [navigate]);

    const handleAuth = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // auth listener will redirect
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;

                alert(
                    "Signup successful! Check your inbox or spam folder for the confirmation email."
                );
                setIsLogin(true);
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
            <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col gap-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    {isLogin ? "Login" : "Sign Up"}
                </h1>

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />

                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />

                <Button
                    label={loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                    fullWidth
                    onClick={handleAuth}
                    disabled={loading}
                />

                <p className="text-center text-gray-600 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        className="text-blue-500 font-semibold hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
