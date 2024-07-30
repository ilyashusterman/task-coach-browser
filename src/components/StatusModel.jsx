import React from "react";
import LoadingIndicator from "./LoadingIndicator";

const StatusModel = ({ progress, isModelLoaded }) => {
  return (
    <div className="status-loading">
      {isModelLoaded ? null : "Loading model..."}
      {progress && progress?.text !== null && progress?.progress !== null ? (
        <LoadingIndicator percentage={progress.progress} text={progress.text} />
      ) : null}
    </div>
  );
};

export default StatusModel;
