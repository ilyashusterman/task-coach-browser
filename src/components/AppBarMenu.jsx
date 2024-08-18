import React, { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import CoachGoalsLogo from "./CoachGoalsLogo";
import { useModel } from "../contexts/ModelContext";

const AppBarMenu = ({ activeTab, setActiveTab }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { displayModelSettings, setDisplayModelSettings } = useModel();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseLeave = () => {
    setMenuOpen(false);
  };

  const menuItems = [
    { id: "kanban", label: "Home" },
    { id: "debugger", label: "Prompt Engineering" },
    { id: "model-settings", label: "Model control panel" },
    { id: "huggingface", label: "HuggingFace Testing models" },
  ];

  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center">
          <button
            className="menu-button text-gray-800 focus:outline-none mr-4"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
          <CoachGoalsLogo />
        </div>
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          className="bg-white border-t border-gray-200 menu-open"
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto py-2 px-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`tab ${
                  activeTab === item.id
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } block w-full text-left py-2 px-4 rounded-lg mb-1 transition-colors duration-200`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppBarMenu;
