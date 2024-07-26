import React from "react";
import { useModel } from "../contexts/ModelContext";

const StatusModel = () => {
  const { progress, isModelLoaded } = useModel();
  return (
    <div className="status-loading">
      {isModelLoaded ? null : "Loading model..."}
      <p>{progress}</p>
    </div>
  );
};

export default StatusModel;
