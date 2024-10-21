import React, { useState, useEffect } from "react";

// Define a type for the option structure
type Option = {
  id: number;
  name: string;
};

// Define props type
type DropdownSearchProps = {
  options: Option[]; // List of dropdown options, now always an array (empty or filled)
  selectedOption: Option | null; // Pre-selected option (can be null)
  onSelectionChange: (selected: Option) => void; // Callback when selection changes
};

const DropdownSearch: React.FC<DropdownSearchProps> = ({
  options,
  selectedOption,
  onSelectionChange,
}) => {
  // State to store the search input and filtered options
  const [searchTerm, setSearchTerm] = useState<string>(
    selectedOption ? selectedOption.name : ""
  );
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Update searchTerm when the selectedOption prop changes
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.name);
    }
  }, [selectedOption]);

  // Handle input change and filter options
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    // Filter options based on the search input
    const filtered = options.filter((option) =>
      option.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOptions(filtered);

    // Show dropdown only if the input has content
    setShowDropdown(query.length > 0);
  };

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    setSearchTerm(option.name); // Set selected option's name as input value
    setShowDropdown(false); // Hide dropdown
    onSelectionChange(option); // Notify parent component of the selection change
  };

  return (
    <div className="dropdown-search relative">
      {/* Added relative positioning for dropdown */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search..."
        className="border p-2 w-full" // Set width to full for better UI
        onClick={() => setShowDropdown(true)} // Show dropdown on input click
      />
      {showDropdown && (
        <ul className="dropdown-menu absolute left-0 right-0 bg-white border border-gray-300 p-2 max-h-60 overflow-y-auto z-10">
          {/* Adjusted styles for overflow and positioning */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="dropdown-item hover:bg-gray-200 cursor-pointer p-1" // Added hover effect and padding
              >
                {option.name}
              </li>
            ))
          ) : (
            <li className="dropdown-item p-1">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default DropdownSearch;
