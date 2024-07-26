import React from "react";

const Tab = ({ children, active }) => {
  return (
    <div className={`tab ${active ? "active" : ""}`}>
      {children}
    </div>
  );
};

export default Tab;
