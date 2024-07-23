import React from "react";
import { useModel } from "../contexts/ModelContext";

const ModelLoader = ({ isLoaded }) => {
  const { progress } = useModel();
  return (
    <div className="model-loader">
      {isLoaded ? "Model loaded successfully!" : "Loading model..."}
      <p>{progress}</p>
    </div>
  );
};

export default ModelLoader;
