import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Input from "../components/input";
import Button from "../components/Button";

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        // Get access_token from URL hash
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace("#", ""));
        const token = params.get("access_token");
        setAccessToken(token);
    }, []);

    const handleResetPassword = async () => {
        if (!password || password !== confirmPassword) {
            alert("Passwords do not match or are empty");
            return;
        }

        if (!accessToken) {
            alert("Invalid or expired link");
            return;
        }

        setLoading(true);
        try {
            // Use Supabase API to update password with access_token
            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: "",
            });

            if (error) throw error;

            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) throw updateError;

            alert("Password updated successfully!");
            navigate("/auth");
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col gap-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">Set New Password</h1>

                <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                    label={loading ? "Saving..." : "Reset Password"}
                    fullWidth
                    onClick={handleResetPassword}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default ResetPasswordPage;
