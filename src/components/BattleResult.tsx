import { motion } from 'framer-motion';
import Image from 'next/image';

interface BattleResultProps {
  battleResult: {
    winner: string;
    battleResult: string;
    challenger: string;
    defender: string;
  };
  onClose: () => void;
}

export function BattleResult({ battleResult, onClose }: BattleResultProps) {
  const [winner, story] = battleResult.battleResult.split('Battle Story:');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#1E293B] rounded-xl p-6 max-w-2xl w-full relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Battle Result Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Battle Results</h2>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-purple-400">{battleResult.challenger}</span>
            <span className="text-gray-400">vs</span>
            <span className="text-purple-400">{battleResult.defender}</span>
          </div>
        </div>

        {/* Winner Announcement */}
        <div className="bg-purple-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-semibold text-white text-center">
            {winner}
          </h3>
        </div>

        {/* Battle Story */}
        <div className="bg-[#0F172A] rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {story}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 