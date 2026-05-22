import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  disabled = false,
  error,
  label,
  required = false,
  multiple = false,
  clearable = true,
  searchable = false,
  className = '',
  size = 'md',
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [value] : []
  );
  const selectRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync internal state with external value
  useEffect(() => {
    if (multiple) {
      setSelectedValues(Array.isArray(value) ? value : value ? [value] : []);
    } else {
      setSelectedValues(value ? (Array.isArray(value) ? [value[0]] : [value]) : []);
    }
  }, [value, multiple]);

  const toggleOption = (optionValue: string) => {
    let newValues: string[];

    if (multiple) {
      newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange(newValues);
    } else {
      newValues = [optionValue];
      setSelectedValues(newValues);
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const clearSelection = () => {
    setSelectedValues([]);
    onChange(multiple ? [] : '');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Generate display label for selected value(s)
  const getDisplayValue = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || placeholder;
    }

    return `${selectedValues.length} options sélectionnées`;
  };

  const sizeClasses = {
    sm: 'text-sm p-1.5',
    md: 'text-base p-2',
    lg: 'text-lg p-2.5',
  };

  return (
    <div 
      className={`relative ${fullWidth ? 'w-full' : 'w-auto'} ${className}`} 
      ref={selectRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div 
        className={`flex items-center justify-between bg-white border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md ${sizeClasses[size]} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-orange-400'} ${
          isOpen ? 'ring-2 ring-orange-200' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-grow truncate text-gray-800">
          {getDisplayValue()}
        </div>
        <div className="flex items-center">
          {selectedValues.length > 0 && clearable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="mr-1 p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 border border-gray-200 overflow-auto">
          {searchable && (
            <div className="px-3 py-2 sticky top-0 bg-white border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
          
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">Aucun résultat</div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option.value}
                className={`px-3 py-2 flex items-center ${
                  option.disabled 
                    ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
                    : selectedValues.includes(option.value)
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-gray-800 hover:bg-gray-100 cursor-pointer'
                }`}
                onClick={(e) => {
                  if (!option.disabled) {
                    e.stopPropagation();
                    toggleOption(option.value);
                  }
                }}
              >
                {multiple && (
                  <div className={`mr-2 w-5 h-5 flex items-center justify-center border ${
                    selectedValues.includes(option.value) 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-gray-300'
                  } rounded`}>
                    {selectedValues.includes(option.value) && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                )}
                <span className="truncate">{option.label}</span>
                {!multiple && selectedValues.includes(option.value) && (
                  <Check size={16} className="ml-auto text-orange-500" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
