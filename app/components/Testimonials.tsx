"use client";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rakesh Narayana",
    role: "Frontend Developer",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Rakesh",
    quote:
      "This platform made my workflow so much easier! The UI is smooth and intuitive.",
    rating: 5,
  },
  {
    name: "Anjali Mehta",
    role: "UI/UX Designer",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Anjali",
    quote:
      "I love how customizable everything is. It feels like it was built for me.",
    rating: 4,
  },
  {
    name: "Arun Kumar",
    role: "Backend Engineer",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Arun",
    quote:
      "Reliable and efficient! Saved us a lot of time during development.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#0d0d0f] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          What our users say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-[#1a1a1d] rounded-2xl p-6 shadow-lg border border-gray-800 hover:border-violet-500 transition"
            >
              {/* Quote */}
              <p className="text-gray-300 italic mb-6">“{t.quote}”</p>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border border-violet-500 shrink-0"
                />
                <div className="leading-tight">
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-gray-400 text-sm">{t.role}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex mt-4 text-yellow-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
