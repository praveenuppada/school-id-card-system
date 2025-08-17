import React, { useState } from "react";
import { submitUpdates } from "../services/teacherService";
import Sidebar from "../components/Sidebar";

export default function SubmitUpdates() {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await submitUpdates();
      setMessage("Updates submitted successfully to Admin!");
    } catch {
      setMessage("Failed to submit updates.");
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Submit Updates</h1>
        {message && <div className="mb-4">{message}</div>}
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 text-white px-6 py-3 rounded hover:bg-yellow-600"
        >
          Submit All Uploaded Photos
        </button>
      </div>
    </div>
  );
}
