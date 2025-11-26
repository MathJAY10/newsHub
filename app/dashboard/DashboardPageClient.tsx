"use client";

import React, { useEffect, useState, useRef } from "react";
import SummaryCard from "@/app/components/SummaryCard";

interface Summary {
  id: number;
  content: string;
  newspaper: { title: string; fileUrl: string };
}

const DashboardPage: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState("");

  const pollIntervalRef = useRef<number | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const uploadingRef = useRef<boolean>(false);

  // keep uploadingRef in sync with state
  useEffect(() => {
    uploadingRef.current = uploading;
  }, [uploading]);

  // ------------------------------
  // Fetch summaries
  // ------------------------------
  const fetchSummaries = async (searchTerm: string = "") => {
    try {
      const url = searchTerm
        ? `/api/summaries?search=${encodeURIComponent(searchTerm)}`
        : `/api/summaries`;

      const res = await fetch(url);
      const data = await res.json();

      setSummaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch summaries error:", err);
      setSummaries([]);
    }
  };

  useEffect(() => {
    fetchSummaries();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // ------------------------------
  // Stage labels
  // ------------------------------
  const updateStageLabel = (p: number) => {
    if (p < 10) return "Queued...";
    if (p < 25) return "Extracting text...";
    if (p < 60) return "Summarizing...";
    if (p < 90) return "Generating PDF...";
    if (p < 100) return "Finalizing...";
    return "Completed!";
  };

  // ------------------------------
  // SAFE POLLING FUNCTION
  // ------------------------------
  const startPollingProgress = (jobId: string | null) => {
    if (!jobId) return; // no job, no polling

    jobIdRef.current = jobId;

    // clear any previous interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = window.setInterval(async () => {
      // always check latest flag
      if (!uploadingRef.current) {
        clearInterval(pollIntervalRef.current!);
        return;
      }

      try {
        const res = await fetch(`/api/progress?jobId=${jobId}`);
        if (!res.ok) {
          // backend is defensive, but still guard here
          console.log("Progress API not ready yet or job missing");
          return;
        }

        const { progress = 0, state } = await res.json();

        setProgress(progress);
        setStageLabel(updateStageLabel(progress));

        if (state === "completed" || progress >= 100) {
          clearInterval(pollIntervalRef.current!);
          setUploading(false);
          setStageLabel("Completed");
          fetchSummaries();
        }

        if (state === "failed") {
          clearInterval(pollIntervalRef.current!);
          setUploading(false);
          setStageLabel("Failed");
        }
      } catch (err) {
        console.error("Progress polling error:", err);
      }
    }, 800);
  };

  // ------------------------------
  // Handle Upload
  // ------------------------------
  const handleUpload = async () => {
    if (uploading) return; // prevent double-clicks
    if (!file) return alert("Select a PDF first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setProgress(0);
      setStageLabel("Initializing...");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.jobId) {
        console.error("Upload failed:", data);
        setUploading(false);
        uploadingRef.current = false;
        return;
      }

      jobIdRef.current = data.jobId;
      startPollingProgress(data.jobId);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
      uploadingRef.current = false;
      setProgress(0);
      setStageLabel("Error");
    }
  };

  // ------------------------------
  // Search
  // ------------------------------
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSummaries(search);
  };

  // ------------------------------
  // Delete
  // ------------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/summaries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete summary.");
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <h1 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-lg">
        📄 Summary Dashboard
      </h1>

      {/* Upload */}
      <div className="mb-10 flex flex-wrap gap-4 items-center justify-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
          className="border border-violet-500/50 bg-gray-800 text-gray-300 rounded-xl px-4 py-2"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
            uploading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-lg"
          }`}
        >
          {uploading ? "Processing..." : "🚀 Upload PDF"}
        </button>
      </div>

      {/* Progress */}
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
          className="border border-violet-500/40 bg-gray-800 text-gray-300 px-4 py-2 rounded-xl w-64"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2 rounded-xl font-semibold text-white"
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
          <p className="text-gray-400 text-center col-span-2">No summaries found.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
