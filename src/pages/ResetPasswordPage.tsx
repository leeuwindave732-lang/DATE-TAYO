import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Input from "../components/input";
import Button from "../components/Button";

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifySession = async () => {
            try {
                // Check if there's a session after returning from the email link
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    alert("Invalid or expired link");
                    navigate("/auth");
                    return;
                }

                if (!data.session) {
                    alert("No active session found. Please request a new password reset link.");
                    navigate("/auth");
                }
            } catch (err: any) {
                console.error(err);
                alert("Something went wrong. Please try again.");
                navigate("/auth");
            }
        };

        verifySession();
    }, [navigate]);

    const handleResetPassword = async () => {
        if (!password || password !== confirmPassword) {
            alert("Passwords do not match or are empty");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

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
