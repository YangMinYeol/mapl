import { useState } from "react";

export default function TypeSelector() {
  const types = ["Memo", "To Do List"];
  const [selectedType, setSelectedType] = useState(types[0]);

  function handleTypeClick(type) {
    setSelectedType(type);
  }

  return (
    <div className="border-b">
      <nav>
        <ul className="flex justify-center type-nav-list">
          {types.map((type) => {
            return (
              <li
                key={type}
                className={`${
                  type === selectedType &&
                  "bg-gray-400 text-white hover:bg-gray-400"
                } flex items-center justify-center w-full py-2 cursor-pointer nav-item hover:bg-gray-200`}
                onClick={() => handleTypeClick(type)}
              >
                <span>{type}</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
