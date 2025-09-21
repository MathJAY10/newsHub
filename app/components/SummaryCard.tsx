"use client";
import React from "react";

interface SummaryCardProps {
  title: string;
  summary: string;
  pdfUrl: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, summary, pdfUrl }) => {
  return (
    <div className="border p-4 rounded-md shadow-md mb-4 hover:shadow-lg transition">
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="my-2">{summary.slice(0, 150)}...</p>
      <div className="flex gap-2">
        <a href={pdfUrl} target="_blank" className="text-blue-600 underline">Read PDF</a>
        <a href={pdfUrl} download className="text-green-600 underline">Download</a>
        <button
          onClick={() => navigator.clipboard.writeText(pdfUrl)}
          className="text-purple-600 underline"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
