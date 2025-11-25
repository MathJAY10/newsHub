// app/page.tsx
"use client";

import { useState } from "react";
import Header from "./components/Header";
import Testimonials from "@/app/components/Testimonials";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the summariser work?",
      a: "Upload a newspaper PDF, our AI extracts the text, performs OCR if needed, and generates a concise summary highlighting key points in seconds.",
    },
    {
      q: "Is my data secure?",
      a: "Yes! All uploaded PDFs are encrypted in transit and deleted after processing, ensuring complete privacy.",
    },
    {
      q: "Is there any cost?",
      a: "Currently the service is free for a limited number of daily summaries. Premium options coming soon!",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(138,43,226,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(138,43,226,0.15)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <Header className="relative z-20" />

      <section className="relative z-10 text-center py-28 px-6 md:px-20">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-lg">
          AI-Powered News Summaries
        </h1>
        <p className="text-xl mt-6 max-w-3xl mx-auto text-gray-300 leading-relaxed">
          Skip the long reads! Upload your newspaper PDFs and get concise, accurate summaries in seconds.
        </p>

        <div className="mt-12 flex flex-col md:flex-row justify-center gap-6">
          <a
            href="/"
            className="px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg transition transform hover:-translate-y-1 hover:scale-105"
          >
            🚀 Watch Demo
          </a>

          {/* SignedIn shows dashboard link; SignedOut shows sign-in redirect */}
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-10 py-4 rounded-xl border border-violet-500 hover:bg-violet-800/30 text-violet-300 font-semibold transition transform hover:-translate-y-1"
            >
              Get Started
            </Link>
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in?redirect_url=/dashboard"
              className="px-10 py-4 rounded-xl border border-violet-500 hover:bg-violet-800/30 text-violet-300 font-semibold transition transform hover:-translate-y-1"
            >
              Get Started
            </Link>
          </SignedOut>
        </div>

        {/* Hero Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
          {[
            { value: "99%", label: "Accuracy" },
            { value: "5 sec", label: "Avg. Summary Time" },
            { value: "1000+", label: "PDFs Processed" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900/50 rounded-2xl p-6 border border-violet-500/40 shadow-lg">
              <h3 className="text-4xl font-bold text-violet-400">{stat.value}</h3>
              <p className="text-gray-300 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-violet-400">Features & Benefits</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "⚡ Lightning-Fast Summaries", text: "Our AI processes large PDFs in seconds with high accuracy." },
            { title: "🎨 Clean, Modern UI", text: "Upload, preview, and download summaries easily with an intuitive UI." },
            { title: "🔒 Secure & Private", text: "Files are encrypted and automatically deleted after processing." },
            { title: "📄 Multi-Format Support", text: "Supports PDFs from newspapers, journals, and magazines." },
            { title: "🌐 Access Anywhere", text: "Works on desktop and mobile devices — fully browser-based." },
            { title: "🧠 AI-Powered", text: "Uses advanced NLP models to summarize text accurately." },
          ].map((f) => (
            <div key={f.title} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-violet-500 rounded-2xl p-8 shadow-lg hover:shadow-violet-600/50 transition transform hover:-translate-y-2">
              <h3 className="text-2xl font-semibold text-violet-300 mb-3">{f.title}</h3>
              <p className="text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />

      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-14 bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-lg">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-violet-500/40 shadow-lg hover:border-violet-500 hover:shadow-violet-600/40 transition">
              <button
                className="w-full text-left px-8 py-6 font-semibold flex justify-between items-center text-white text-xl md:text-2xl hover:text-violet-300 transition"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {f.q}
                <span className="text-violet-400 text-3xl font-bold">{openFaq === i ? "−" : "+"}</span>
              </button>

              <div className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? "max-h-60 pb-6 border-t border-violet-600/30" : "max-h-0"}`}>
                <p className="text-gray-300 text-lg leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-16 text-center">
        <SignedIn>
          <Link href="/dashboard" className="inline-block px-12 py-5 rounded-full bg-violet-500 text-white font-bold text-2xl shadow-xl animate-bounce hover:scale-105 hover:bg-violet-600 transition transform">
            🚀 Go to Dashboard
          </Link>
        </SignedIn>

        <SignedOut>
          <Link href="/sign-in?redirect_url=/dashboard" className="inline-block px-12 py-5 rounded-full bg-violet-500 text-white font-bold text-2xl shadow-xl animate-bounce hover:scale-105 hover:bg-violet-600 transition transform">
            🚀 Start Free Trial
          </Link>
        </SignedOut>
      </section>

      <footer className="relative z-10 bg-black border-t border-violet-600/30 text-gray-400 text-center py-6">
        © {new Date().getFullYear()} News Summariser — All rights reserved.
      </footer>
    </main>
  );
}
