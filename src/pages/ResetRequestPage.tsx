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
                redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
            });
            if (error) throw error;
            alert("Check your email for the password reset link!");
            setEmail("");
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
                <h1 className="text-3xl font-bold text-center text-black">Reset Password</h1>

                <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border border-sage-300 text-black placeholder-sage-500 rounded-lg p-3 focus:ring-2 focus:ring-sage-400"
                />

                <Button
                    label={loading ? "Sending..." : "Send Reset Link"}
                    fullWidth
                    onClick={handleResetRequest}
                    disabled={loading}
                    className="bg-[#9CAF88] text-white hover:bg-[#88a678]"
                />
            </div>
        </div>
    );
};

export default ResetRequestPage;
