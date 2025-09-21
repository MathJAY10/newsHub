'use client';

import { useState } from 'react';
import Header from './components/Header';
 // import your auth-aware Header

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the summariser work?',
      a: 'Upload a newspaper PDF, our AI extracts the text and generates a concise summary.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes, we store files securely and delete them after processing unless you choose to save them.'
    },
    {
      q: 'Is there any cost?',
      a: 'Currently the service is free for limited daily summaries.'
    }
  ];

  return (
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <Header /> {/* Auth-aware navbar */}

      {/* Padding so content not hidden under navbar */}
      <div className="pt-20">
        {/* ===== HERO ===== */}
        <section className="bg-blue-600 text-white text-center py-20 px-4">
          <h1 className="text-5xl font-extrabold mb-4">AI-Powered News Summaries</h1>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Get crisp summaries of long newspaper PDFs in seconds.
          </p>
          <a
            href="/upload"
            className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100"
          >
            Try It Now
          </a>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Fast Summaries', text: 'Summarise large PDFs in seconds using advanced AI.' },
              { title: 'Clean UI', text: 'Simple, intuitive interface for effortless uploads.' },
              { title: 'Secure Storage', text: 'Your files are encrypted and removed after processing.' }
            ].map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl shadow text-center">
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CREATOR NOTE ===== */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Creator’s Note</h2>
            <p className="text-gray-700 leading-relaxed">
              “I built News Summariser to save time for avid readers like myself.
              I wanted a quick way to stay informed without reading every article.
              Hope it helps you as much as it helps me!”
            </p>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow">
                <button
                  className="w-full text-left px-6 py-4 font-medium flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <span>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-700 border-t">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-gray-900 text-gray-300 text-center py-6">
          © {new Date().getFullYear()} News Summariser — All rights reserved.
        </footer>
      </div>
    </main>
  );
}
