import React from "react";

interface ButtonProps {
    label: string;
    onClick?: () => void | Promise<void>; // allow async functions
    fullWidth?: boolean;
    disabled?: boolean; // add disabled prop
    className?: string; // optional extra styling
}

const Button: React.FC<ButtonProps> = ({ label, onClick, fullWidth, disabled, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            bg-accent hover:bg-accentHover text-white px-6 py-2 rounded-lg transition
            ${fullWidth ? "w-full" : ""}
            ${disabled ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" : ""}
            ${className || ""}
        `}
    >
        {label}
    </button>
);

export default Button;
