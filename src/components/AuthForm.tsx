"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaUser, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";
import { WalletSelector } from "./WalletSelector";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const { account, connected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    try {
      const response = await axios.post("/api/auth", {
        username,
        walletAddress: account.address
      });

      console.log("Authentication successful", response.data);
      setSuccessMessage(response.data.message);
      setErrorMessage("");
      
      localStorage.setItem("user", JSON.stringify({
        username,
        walletAddress: account.address,
        has_community: false
      }));
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error during authentication:", error);
      setErrorMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
        Welcome to TeleGage
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <FaUser className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            placeholder="Username"
            required
          />
        </div>

        <WalletSelector />

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-sm mt-2">{successMessage}</p>
        )}

        <motion.button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue
        </motion.button>
      </form>
    </div>
  );
};
