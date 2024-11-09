"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "../../assets/images/Telegage_logo.png";
import { motion } from "framer-motion";
import { GitHubProfile } from "../../components/GitHubProfile";
import { Switch } from "@/components/ui/switch";
import { BattleView } from "../../components/BattleView";
import { Balance } from "../../components/Balance";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [view, setView] = useState<"profile" | "battle">("profile");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/auth");
    } else {
      const { username } = JSON.parse(user);
      setUsername(username);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {username && (
            <>
              <div className="flex justify-between items-center mb-8">
                <Image src={logoImg} alt="Logo" className="h-12 w-auto" />
                <Balance />
              </div>
              
              {/* Toggle Switch */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <span className={`text-white ${view === "profile" ? "opacity-100" : "opacity-50"}`}>
                  My Profile
                </span>
                <Switch
                  checked={view === "battle"}
                  onCheckedChange={(checked) => setView(checked ? "battle" : "profile")}
                />
                <span className={`text-white ${view === "battle" ? "opacity-100" : "opacity-50"}`}>
                  Battle
                </span>
              </div>

              {/* Content */}
              {view === "profile" ? (
                <GitHubProfile username={username} />
              ) : (
                <BattleView />
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
