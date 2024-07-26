import React from "react";
import { useModel } from "../contexts/ModelContext";

const StatusModel = ({ isLoaded }) => {
  const { progress } = useModel();
  return (
    <div className="status-loading">
      {isLoaded ? null : "Loading model..."}
      <p>{progress}</p>
    </div>
  );
};

export default StatusModel;
