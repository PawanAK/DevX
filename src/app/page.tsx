"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-[#E2E8F0] mb-6">
            DevX Battle
          </h1>
          <p className="text-xl text-[#E2E8F0] mb-12 max-w-2xl mx-auto">
            Battle with other developers using your GitHub stats. Prove your worth and climb the ranks!
          </p>

          <div className="flex justify-center space-x-6">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-[#6D28D9] hover:bg-[#4C1D95] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Start Your Journey
              </motion.button>
            </Link>
            <Link href="/leaderboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-transparent border-2 border-[#6D28D9] text-[#E2E8F0] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#6D28D9]/10 transition-colors"
              >
                View Leaderboard
              </motion.button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#1E293B] p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold text-[#F59E0B] mb-3">Battle Cards</h3>
              <p className="text-[#E2E8F0]">Your GitHub stats become your battle power. Repositories, commits, and contributions matter!</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#1E293B] p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold text-[#F59E0B] mb-3">Real-time Battles</h3>
              <p className="text-[#E2E8F0]">Challenge other developers to epic battles and prove your coding prowess!</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#1E293B] p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold text-[#F59E0B] mb-3">Global Rankings</h3>
              <p className="text-[#E2E8F0]">Climb the global leaderboard and become the ultimate developer warrior!</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
