"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PersonalAccountButton() {
  return (
    <Link href="/dashboard">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-pink-600 text-black font-bold px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-orange-500/40"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Личный кабинет
        </span>

        <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <span className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-white/20 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-700"></span>
        </span>
      </motion.button>
    </Link>
  );
}
