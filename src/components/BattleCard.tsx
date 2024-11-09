import { motion } from 'framer-motion';
import Image from 'next/image';

interface BattleCardProps {
  nft: any;
  username: string;
  onChallenge: () => void;
}

export function BattleCard({ nft, username, onChallenge }: BattleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E293B] rounded-xl p-6 border border-purple-600 hover:border-purple-400 transition-colors"
    >
      <div className="flex flex-col gap-4">
        {/* NFT Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
          <Image
            src={nft.metadata.image}
            alt={nft.current_token_data.token_name}
            width={500}
            height={500}
            className="transition-transform hover:scale-105 "
          />
        </div>

        {/* NFT Details */}
        <div className="space-y-2">
          
          
          {/* Battle Button */}
          <button
            onClick={onChallenge}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Challenge to Battle
          </button>
        </div>
      </div>
    </motion.div>
  );
} 