import React, { useEffect, useState } from "react";
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

    // Redirect if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Session check error:", error);
                return;
            }
            if (session?.user) navigate("/profile");
        };
        checkSession();
    }, [navigate]);

    const handleAuth = async () => {
        const emailTrimmed = email.trim();
        const passwordTrimmed = password.trim();

        if (!emailTrimmed || (!passwordTrimmed && isLogin)) {
            alert("Please enter email" + (isLogin ? " and password" : ""));
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                // Password login only
                const { error } = await supabase.auth.signInWithPassword({
                    email: emailTrimmed,
                    password: passwordTrimmed,
                });
                if (error) throw error;
                navigate("/profile");
            } else {
                // Signup flow
                const { error } = await supabase.auth.signUp({
                    email: emailTrimmed,
                    password: passwordTrimmed,
                    options: { emailRedirectTo: import.meta.env.VITE_APP_URL + "/profile" },
                });
                if (error) throw error;
                alert("Signup successful! Please check your email to confirm.");
                setIsLogin(true);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
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

                <div className="text-center mt-2 text-gray-600 text-sm">
                    {isLogin ? (
                        <>
                            Don't have an account?{" "}
                            <button
                                className="text-blue-500 font-semibold hover:underline"
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                            <div className="mt-1">
                                <button
                                    className="text-blue-500 font-semibold hover:underline text-sm"
                                    onClick={() => navigate("/reset-request")}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                className="text-blue-500 font-semibold hover:underline"
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
