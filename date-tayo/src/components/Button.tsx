interface ButtonProps {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit";
}

const Button = ({ label, onClick, type = "button"}: ButtonProps) => {
    return (
        <button 
            type= {type}
            onClick= {onClick}
            className="bg-purple-700 hover:bg-purple-800 transition text-white px-6 py-2 rounded-lg"
        >
            {label}
        </button>
    );
};

export default Button;