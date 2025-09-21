"use client";
import React, { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";

interface Summary {
  id: number;
  content: string;
  newspaper: { title: string; fileUrl: string };
}

const DashboardPage = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const fetchSummaries = async (searchTerm: string = "") => {
    try {
      const url = searchTerm ? `/api/summaries?search=${searchTerm}` : "/api/summaries";
      const res = await fetch(url);
      const data = await res.json();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSummaries([]);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("/api/upload", { method: "POST", body: formData });
      setFile(null);
      fetchSummaries(); // refresh dashboard
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSummaries(search);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Upload PDF */}
      <div className="mb-4 flex gap-2">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-1 rounded">
          Upload PDF
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search summaries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded flex-grow"
        />
        <button type="submit" className="bg-gray-600 text-white px-4 py-1 rounded">
          Search
        </button>
      </form>

      {/* Summaries */}
      {summaries.length > 0 ? (
        summaries.map((s) => (
          <SummaryCard
            key={s.id}
            title={s.newspaper.title}
            summary={s.content}
            pdfUrl={s.newspaper.fileUrl}
          />
        ))
      ) : (
        <p>No summaries available</p>
      )}
    </div>
  );
};

export default DashboardPage;
