"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "../../assets/images/Telegage_logo.png";
import { motion } from "framer-motion";
import { GitHubProfile } from "../../components/GitHubProfile";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

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
              </div>
              
              {/* GitHub Profile Section */}
              <div className="mt-8">
                <GitHubProfile username={username} />
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
