import React, { useState, useRef, useEffect } from 'react';

type Option = {
  value: string | number;
  label: string;
};

export function CustomDropdown({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  renderLabel: (option: Option) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button className="custom-dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? renderLabel(selectedOption) : 'Select...'}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul className="custom-dropdown-menu">
          {options.map(option => (
            <li
              key={option.value}
              className={`custom-dropdown-item ${option.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {renderLabel(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
