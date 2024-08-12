// AppBarMenu.js
import React, { useState } from "react";
import CoachGoalsLogo from "./CoachGoalsLogo";
import "./AppBarMenu.css"; // Import the new CSS
import { useModel } from "../contexts/ModelContext";

const AppBarMenu = ({ activeTab, setActiveTab }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { displayModelSettings, setDisplayModelSettings } = useModel();
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
      <div
        className={
          menuOpen ? "bg-green-700 menu-open" : "bg-green-700 menu-closed"
        }
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
            className="block py-1 px-4 text-green-800"
            onClick={() => setDisplayModelSettings(!displayModelSettings)}
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
    </div>
  );
};

export default AppBarMenu;
