import React, { useState, useEffect } from "react";
import { Menu, X, Home, MessageSquare, Settings, Database } from "lucide-react";
import CoachGoalsLogo from "./CoachGoalsLogo";
import "./Sidebar.css";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on initial load

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { id: "kanban", label: "Home", icon: Home },
    { id: "debugger", label: "Prompt Engineering", icon: MessageSquare },
    { id: "model-settings", label: "Model Control Panel", icon: Settings },
    { id: "huggingface", label: "HuggingFace Testing", icon: Database },
  ];

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="flex items-center justify-between p-4">
        {isOpen && <CoachGoalsLogo />}
        <button onClick={toggleSidebar} className="sidebar-icon">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} />
            {isOpen && <span className="sidebar-tooltip">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
