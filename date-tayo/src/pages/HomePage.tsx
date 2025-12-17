import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Navbar from "../components/navbar";

const HomePage: React.FC = () => {
    return (
        <div className ="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-700 to-black text-white">
            <h1 className ="text-5xl font-bold mb-8">Date Tayo!</h1>
            <p className ="mb-6 text-center max-w-md">
                Tara na at makipag connect sa mga bagong tao sa paligid mo!
            </p>
            <div className ="flex gap-4">
                <Link to="/signup">
                    <Button label="Sign Up"/>
                </Link>
                <Link to="/login">
                    <Button label="Log In" />
                </Link>
                <Link to="/map">
                    <Button label="View Map" />
                </Link>
            </div>
        </div>
    );
};

export default HomePage;