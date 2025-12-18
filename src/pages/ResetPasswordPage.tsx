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
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                alert("Invalid or expired link");
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
        <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
            <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col gap-6 border border-sage-200">
                <h1 className="text-3xl font-bold text-center text-black">Set New Password</h1>

                <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white border border-sage-300 text-black placeholder-sage-500 rounded-lg p-3 focus:ring-2 focus:ring-sage-400"
                />
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white border border-sage-300 text-black placeholder-sage-500 rounded-lg p-3 focus:ring-2 focus:ring-sage-400"
                />

                <Button
                    label={loading ? "Saving..." : "Reset Password"}
                    fullWidth
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="bg-[#9CAF88] text-white hover:bg-[#88a678]"
                />
            </div>
        </div>
    );
};

export default ResetPasswordPage;
