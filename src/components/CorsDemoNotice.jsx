import React from "react";

const CorsDemoNotice = () => {
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <p className="text-base text-gray-600">
        For testing purposes, please enable{" "}
        <a
          className="underline text-blue-600 hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
          href="https://cors-anywhere.herokuapp.com/corsdemo"
        >
          CORS Anywhere
        </a>{" "}
        to allow your request to replicate the API.
      </p>
    </div>
  );
};

export default CorsDemoNotice;
