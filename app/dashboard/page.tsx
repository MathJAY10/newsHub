"use client";
import React, { useEffect, useState, useRef } from "react";
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState("");
  const jobIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSummaries = async (searchTerm: string = "") => {
    try {
      const res = await fetch("/api/summaries");
      const data = await res.json();

      const summariesArray: Summary[] = Array.isArray(data) ? data : data.summaries ?? [];

      if (!searchTerm) {
        setSummaries(summariesArray);
      } else {
        const filtered = summariesArray.filter((s) =>
          s.newspaper.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSummaries(filtered);
      }
    } catch (err) {
      console.error(err);
      setSummaries([]);
    }
  };

  useEffect(() => {
    fetchSummaries();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const updateStageLabel = (progress: number) => {
    if (progress < 20) return "Initializing...";
    if (progress < 40) return "OCR started...";
    if (progress < 60) return "Text truncated...";
    if (progress < 80) return "Summarizing...";
    if (progress < 100) return "Generating PDF...";
    return "Done!";
  };

  const startPollingProgress = (jobId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress?jobId=${jobId}`);
        const data = await res.json();
        const currentProgress = data.progress ?? 0;
        setProgress(currentProgress);
        setStageLabel(updateStageLabel(currentProgress));
        if (currentProgress >= 100) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setUploading(false);
          fetchSummaries();
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setProgress(0);
      setStageLabel("Initializing...");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      const jobId = data.jobId;
      if (!jobId) throw new Error("No jobId returned from upload");
      jobIdRef.current = jobId;
      startPollingProgress(jobId);
      setFile(null);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setStageLabel("");
      setProgress(0);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSummaries(search);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this summary?")) return;

    try {
      const res = await fetch(`/api/summaries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete summary");
      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete summary");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">📄 PDF Summaries Dashboard</h1>

      {/* Upload Section */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleUpload}
          className={`px-6 py-2 rounded-lg font-semibold text-white shadow ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          } transition`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full mb-6">
          <div className="relative h-5 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
            <div
              className="absolute left-0 top-0 h-5 bg-gradient-to-r from-blue-400 to-blue-600 animate-gradient-x"
              style={{ width: `${progress}%`, transition: "width 0.4s" }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">{stageLabel}</p>
        </div>
      )}

      {/* Search Section */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Search summaries by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
        >
          Search
        </button>
      </form>

      {/* Summaries Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaries.length > 0 ? (
          summaries.map((s) => (
            <SummaryCard
              key={s.id}
              title={s.newspaper.title}
              summary={s.content}
              pdfUrl={s.newspaper.fileUrl}
              onDelete={() => handleDelete(s.id)}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No summaries available. Upload a PDF to get started!
          </p>
        )}
      </div>

      {/* Animated gradient for progress */}
      <style>
        {`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 1.5s linear infinite;
        }
      `}
      </style>
    </div>
  );
};

export default DashboardPage;
