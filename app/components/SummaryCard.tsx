"use client";
import React from "react";

interface SummaryCardProps {
  title: string;
  summary: string;
  pdfUrl: string;
  onDelete: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, summary, pdfUrl, onDelete }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-violet-600/40 rounded-2xl p-6 shadow-lg hover:shadow-fuchsia-500/40 transition transform hover:-translate-y-2">
      <h2 className="font-bold text-2xl text-violet-300 mb-3">{title}</h2>
      <p className="text-gray-300 mb-6 leading-relaxed">{summary.slice(0, 180)}...</p>
      <div className="flex gap-3">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-white font-medium hover:scale-105 transition"
        >
          📖 Read
        </a>
        <a
          href={pdfUrl}
          download
          className="px-4 py-2 bg-green-600 rounded-xl text-white font-medium hover:bg-green-700 hover:scale-105 transition"
        >
          ⬇️ Download
        </a>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 hover:scale-105 transition"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
