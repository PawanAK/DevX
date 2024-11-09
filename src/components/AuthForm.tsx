"use client";
import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { account, connected, connect, wallets } = useWallet();

  // Auto-connect to the last used wallet
  useEffect(() => {
    const autoConnect = async () => {
      const lastWallet = localStorage.getItem("lastWallet");
      if (lastWallet && wallets.length > 0) {
        const wallet = wallets.find(w => w.name === lastWallet);
        if (wallet) {
          try {
            await connect(wallet.name);
          } catch (error) {
            console.error("Auto-connect failed:", error);
          }
        }
      }
    };
    autoConnect();
  }, [wallets, connect]);

  const handleWalletLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!connected || !account) {
      setErrorMessage("Please connect your wallet first");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth", {
        username,
        walletAddress: account.address
      });

      handleSuccessfulAuth(response.data);
    } catch (error: any) {
      console.error("Error during authentication:", error);
      setErrorMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth", {
        username
      });

      handleSuccessfulAuth(response.data);
    } catch (error: any) {
      console.error("Error during authentication:", error);
      setErrorMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulAuth = (data: any) => {
    setSuccessMessage(data.message);
    setErrorMessage("");
    
    localStorage.setItem("user", JSON.stringify({
      username: data.user.username,
      walletAddress: data.user.walletAddress,
      has_community: false
    }));

    if (account) {
      localStorage.setItem("lastWallet", account.name);
    }
    
    router.push("/dashboard");
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
        Welcome to TeleGage
      </h2>
      
      <div className="space-y-6">
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

        <div className="flex gap-4">
          <motion.button
            onClick={handleUsernameLogin}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            Login with Username
          </motion.button>

          <motion.button
            onClick={handleWalletLogin}
            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            Connect Wallet
          </motion.button>
        </div>
      </div>
    </div>
  );
};
