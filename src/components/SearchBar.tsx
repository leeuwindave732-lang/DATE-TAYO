import React, { useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search...", onSearch }) => {
    const [query, setQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="flex items-center w-full max-w-md border rounded-md overflow-hidden bg-lightGray">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 px-4 py-2 text-textMain outline-none bg-lightGray"
            />
            <button
                onClick={() => onSearch(query)}
                className="px-4 py-2 bg-accent text-white hover:bg-accentHover transition-colors"
            >
                Search
            </button>
        </div>
    );
};

export default SearchBar;
