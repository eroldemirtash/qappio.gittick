"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { Button } from "./Button";

interface ComboboxOption {
  value: string;
  label: string;
  avatar?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  allowCustom?: boolean;
  onCustomValue?: (value: string) => void;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seçin...",
  className = "",
  error = false,
  allowCustom = false,
  onCustomValue
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchTerm(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle option selection
  const handleSelectOption = (option: ComboboxOption) => {
    setInputValue(option.label);
    setSearchTerm("");
    onChange(option.value);
    setIsOpen(false);
  };

  // Handle custom value creation
  const handleCreateCustom = () => {
    if (allowCustom && onCustomValue && inputValue.trim()) {
      onCustomValue(inputValue.trim());
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  // Handle clear selection
  const handleClear = () => {
    setInputValue("");
    setSearchTerm("");
    onChange("");
    setIsOpen(false);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        handleSelectOption(filteredOptions[0]);
      } else if (allowCustom && inputValue.trim()) {
        handleCreateCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set input value when value prop changes
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!value) {
      setInputValue("");
    }
  }, [value, selectedOption]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full h-10 px-3 pr-20 rounded-xl border ${
            error ? "border-rose-500" : "border-slate-200"
          } bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${className}`}
        />
        
        <div className="absolute right-1 top-1 flex items-center gap-1">
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-3 ${
                    value === option.value ? "bg-brand-50 text-brand-700" : "text-slate-900"
                  }`}
                >
                  {option.avatar && (
                    <img
                      src={option.avatar}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <span className="flex-1">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-brand-600" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-2 px-3 text-slate-500 text-sm">
              {searchTerm ? "Sonuç bulunamadı" : "Seçenek yok"}
            </div>
          )}

          {allowCustom && inputValue.trim() && !filteredOptions.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase()) && (
            <div className="border-t border-slate-200">
              <button
                type="button"
                onClick={handleCreateCustom}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-600 text-sm"
              >
                "{inputValue}" olarak ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
