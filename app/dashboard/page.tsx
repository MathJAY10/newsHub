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
    return () => {
      // cleanup polling interval on unmount
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
          fetchSummaries(); // refresh after complete
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Upload PDF */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
        />
        <button
          onClick={handleUpload}
          className={`px-4 py-1 rounded text-white ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-600 h-4 rounded"
              style={{ width: `${progress}%`, transition: "width 0.3s" }}
            />
          </div>
          <p className="text-sm mt-1">{stageLabel}</p>
        </div>
      )}

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
