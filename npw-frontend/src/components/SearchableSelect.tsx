import React, { useState, useRef, useEffect, useMemo } from 'react';

interface SearchableSelectProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ label, options, value, onChange, disabled = false }) => {
    const [searchTerm, setSearchTerm] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(value); // Reset search term to current value if user clicks away
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [value]);
    
    useEffect(() => {
        // When the external value changes, update the internal search term
        setSearchTerm(value);
    }, [value]);
    
    useEffect(() => {
        if (disabled) {
            setSearchTerm('');
            setIsOpen(false);
        }
    }, [disabled]);

    const handleSelect = (option: string) => {
        onChange(option);
        setSearchTerm(option);
        setIsOpen(false);
    };

    return (
        <div className="mb-6 relative" ref={containerRef}>
            <label className={`block font-bold mb-2 ${disabled ? 'text-gray-500' : 'text-nexus-light'}`}>{label}</label>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full bg-nexus-gray border border-nexus-purple/50 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nexus-blue disabled:bg-nexus-dark/50 disabled:cursor-not-allowed disabled:text-gray-500"
                autoComplete="off"
                disabled={disabled}
                placeholder={disabled ? 'Select a CPU first' : ''}
            />
            {isOpen && !disabled && filteredOptions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-nexus-dark border border-nexus-purple/50 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map(option => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 text-sm text-white cursor-pointer hover:bg-nexus-blue/20"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelect;