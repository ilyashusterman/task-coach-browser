import React, { useState, useRef, useEffect } from "react";
import CoachGoalsLogo from "./CoachGoalsLogo";
import "./AppBarMenu.css";
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

  return (
    <div className="bg-green-600 text-green-800">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center">
          <button
            className="menu-button text-green-800 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <CoachGoalsLogo />
          <span className="ml-4 text-xl text-green-800">Coach Goals</span>
        </div>
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          className="bg-green-700 menu-open"
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto py-2">
            <button
              className={`tab ${
                activeTab === "kanban" ? "active" : ""
              } block py-1 px-4 text-green-800`}
              onClick={() => setActiveTab("kanban")}
            >
              Home
            </button>
            <button
              className={`tab ${
                activeTab === "debugger" ? "active" : ""
              } block py-1 px-4 text-green-800`}
              onClick={() => setActiveTab("debugger")}
            >
              Prompt Engineering
            </button>
            <button
              className={`tab ${
                activeTab === "model-settings" ? "active" : ""
              } block py-1 px-4 text-green-800`}
              onClick={() => setActiveTab("model-settings")}
            >
              Model control panel
            </button>
            <button
              className={`tab ${
                activeTab === "huggingface" ? "active" : ""
              } block py-1 px-4 text-green-800`}
              onClick={() => setActiveTab("huggingface")}
            >
              HuggingFace Testing models
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppBarMenu;
