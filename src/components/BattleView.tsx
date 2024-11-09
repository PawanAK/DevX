"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface SBTData {
  username: string;
  sbtAddress: string;
  walletAddress: string;
  // Add other SBT metadata fields
}

export function BattleView() {
  const [sbts, setSbts] = useState<SBTData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSBTs() {
      try {
        const response = await fetch("/api/get-all-sbts");
        const data = await response.json();
        setSbts(data.sbts);
      } catch (error) {
        console.error("Error fetching SBTs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSBTs();
  }, []);

  if (loading) {
    return <div className="text-white text-center">Loading battle arena...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sbts.map((sbt, index) => (
        <motion.div
          key={sbt.sbtAddress}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-[#1E293B] border-[#4F21A1] hover:border-[#A45EDB] transition-colors">
            <CardHeader>
              <CardTitle className="text-[#F59E0B]">{sbt.username}'s SBT</CardTitle>
              <div className="text-[#E2E8F0] mt-2">
                <p className="truncate">SBT: {sbt.sbtAddress}</p>
                {/* Add other SBT details/stats here */}
              </div>
              <button className="mt-4 bg-[#4F21A1] hover:bg-[#A45EDB] text-white px-4 py-2 rounded-lg transition-colors">
                Challenge
              </button>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 