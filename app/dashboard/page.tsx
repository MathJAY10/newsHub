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
    if (progress < 60) return "Extracting text...";
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <h1 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-lg">
        📄 Summary Dashboard
      </h1>

      {/* Upload PDF */}
      <div className="mb-10 flex flex-wrap gap-4 items-center justify-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
          className="border border-violet-500/50 bg-gray-800 text-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-violet-400"
        />
        <button
          onClick={handleUpload}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition transform hover:scale-105 ${
            uploading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-lg hover:shadow-violet-500/50"
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "🚀 Upload PDF"}
        </button>
      </div>

      {uploading && (
        <div className="w-full mt-4">
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-4 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm mt-2 text-center text-gray-300">{stageLabel}</p>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-10 flex gap-3 justify-center">
        <input
          type="text"
          placeholder="🔍 Search summaries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-violet-500/40 bg-gray-800 text-gray-300 px-4 py-2 rounded-xl flex-grow focus:ring-2 focus:ring-fuchsia-500"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-fuchsia-500/50 transition"
        >
          Search
        </button>
      </form>

      {/* Summaries */}
      <div className="grid md:grid-cols-2 gap-6">
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
          <p className="text-gray-400 text-center col-span-2">No summaries available.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
