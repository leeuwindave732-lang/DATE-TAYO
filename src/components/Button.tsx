import React from "react";
// ...existing code...

type ButtonProps = {
    label: string;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    className?: string;
    variant?: "primary" | "secondary";
};

const Button: React.FC<ButtonProps> = ({ label, onClick, fullWidth, disabled, className = "", variant = "primary" }) => {
    const base = "px-4 py-2 rounded-lg font-semibold focus:outline-none";
    const widthClass = fullWidth ? "w-full" : "inline-block";
    const variantClass = variant === "secondary"
        ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        : "bg-indigo-600 text-white hover:bg-indigo-700";

    return (
        <button
            className={`${base} ${widthClass} ${variantClass} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default Button;
