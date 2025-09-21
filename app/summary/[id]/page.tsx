"use client";
import React, { useEffect, useState } from "react";

interface Summary {
  id: number;
  content: string;
  newspaper: { title: string; fileUrl: string };
}

interface Props {
  params: { id: string };
}

const SummaryPage: React.FC<Props> = ({ params }) => {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch(`/api/summaries?id=${params.id}`)
      .then(res => res.json())
      .then(data => setSummary(data[0]));
  }, [params.id]);

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{summary.newspaper.title}</h1>
      <p>{summary.content}</p>
      <a href={summary.newspaper.fileUrl} download className="text-blue-600 underline mt-4 inline-block">
        Download PDF
      </a>
    </div>
  );
};

export default SummaryPage;
