import React from "react";

interface InputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ type, value, onChange, placeholder, className, disabled }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-accent ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"} ${className || ""}`}
    />
  );
};

export default Input;
