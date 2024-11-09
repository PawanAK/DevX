"use client";
import { AuthForm } from "@/components/AuthForm";
import { motion } from "framer-motion";


export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <h1 className="text-4xl font-bold text-[#E2E8F0]">DevX Battle</h1>
        </motion.div>
        <AuthForm />
      </motion.div>
    </div>
  );
}