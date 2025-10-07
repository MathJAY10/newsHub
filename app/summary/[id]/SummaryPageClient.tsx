"use client";

import { useEffect, useState } from "react";

interface Summary {
  id: number;
  content: string;
  newspaper: { title: string; fileUrl: string };
  userId: string;
}

export default function SummaryPageClient({ id }: { id: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch summary from API
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/summaries?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then((data: Summary) => setSummary(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf-summarize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to generate summary PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "summary.pdf";
      a.click();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) alert(err.message);
      else alert("Error generating summary PDF");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!summary) return <p className="p-6">Summary not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{summary.newspaper.title}</h1>
      <p>{summary.content}</p>

      <a
        href={summary.newspaper.fileUrl}
        download
        className="text-blue-600 underline"
      >
        Download Original PDF
      </a>

      {/* PDF Upload Form */}
      <form onSubmit={handleUpload} className="mt-6 space-x-2">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={uploading}
        >
          {uploading ? "Generating..." : "Generate Summary PDF"}
        </button>
      </form>
    </div>
  );
}
