import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import Input from "../components/input";
import Button from "../components/Button";

const ResetRequestPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetRequest = async () => {
        const emailTrimmed = email.trim();
        if (!emailTrimmed) {
            alert("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
                redirectTo: window.location.origin + "/reset-password",
            });
            if (error) throw error;
            alert("Check your email for the password reset link!");
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
                <h1 className="text-3xl font-bold text-center text-gray-800">Reset Password</h1>

                <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />

                <Button
                    label={loading ? "Sending..." : "Send Reset Link"}
                    fullWidth
                    onClick={handleResetRequest}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default ResetRequestPage;
