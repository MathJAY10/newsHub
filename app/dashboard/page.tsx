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
  
      // Ensure data is an array
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
  
      // Remove deleted summary locally for instant UI update
      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete summary");
    }
  };
  

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">📄 Summary Dashboard</h1>

      {/* Upload PDF */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
          className="border rounded px-3 py-1"
        />
        <button
          onClick={handleUpload}
          className={`px-5 py-2 rounded text-white font-semibold ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        {uploading && (
          <div className="w-full mt-3">
            <div className="w-full bg-gray-200 rounded h-4">
              <div
                className="bg-blue-600 h-4 rounded transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm mt-1 text-gray-700">{stageLabel}</p>
          </div>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search summaries by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      {/* Summaries */}
      <div className="grid md:grid-cols-2 gap-4">
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
          <p className="text-gray-500 col-span-2">No summaries available.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
