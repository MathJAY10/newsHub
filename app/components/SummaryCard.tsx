"use client";
import React from "react";

interface SummaryCardProps {
  title: string;
  summary: string;
  pdfUrl: string;
  onDelete: () => void; // delete action
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, summary, pdfUrl, onDelete }) => {
  return (
    <div className="border p-4 rounded-lg shadow-lg mb-4 hover:shadow-xl transition duration-300">
      <h2 className="font-semibold text-xl text-gray-800">{title}</h2>
      <p className="text-gray-600 my-2">{summary.slice(0, 150)}...</p>
      <div className="flex gap-3 mt-2">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Read PDF
        </a>
        <a
          href={pdfUrl}
          download
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Download
        </a>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
