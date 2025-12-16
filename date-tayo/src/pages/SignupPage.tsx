import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const SignupPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => { 
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else navigate("/login"); //redirect to login
    };

        return (
            <div className = "min-h-screen flex flex-col items-center justify-center bg-black text-white" >
                <h1 className="text-3xl font-bold mb-6">SignUp Na!</h1>
                <input 
                    className="mb-4 p-2 rounded text-black"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="mb-4 p-2 rounded text-black"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="bg-purple-700 px-4 py-2 rounded"
                    onClick={handleSignup}
                >
                    Sign Up
                </button>
            </div>
        );
};

export default SignupPage;
