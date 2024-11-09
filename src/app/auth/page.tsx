"use client";
import { AuthForm } from "@/components/AuthForm";
import { motion } from "framer-motion";
import Image from "next/image";
import logoImg from "@/assets/images/Telegage_logo.png";

export default function AuthPage() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A45EDB_82%)]">
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
          <Image src={logoImg} alt="TeleGage Logo" width={80} height={80} />
        </motion.div>
        <AuthForm />
      </motion.div>
    </div>
  );
}