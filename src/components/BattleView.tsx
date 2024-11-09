"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface NFTMetadata {
  image: string;
  // Add other metadata fields if needed
}

export function BattleView() {
  const [allNfts, setAllNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetadata = async (uri: string): Promise<NFTMetadata> => {
    try {
      console.log('Fetching metadata from URI:', uri);
      const response = await fetch(uri);
      const metadata = await response.json();
      console.log('Fetched metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return { image: '' }; // Return default if fetch fails
    }
  };

  const fetchAllUserNfts = async () => {
    try {
        const currentUserWallet = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).walletAddress : '';
        console.log('Current user wallet:', currentUserWallet);
      
      const usersResponse = await fetch('/api/get-all-users-sbts');
      const { users } = await usersResponse.json();
      const sbtAddress = users[0].sbtAddress; // Get sbtAddress from first user
      console.log('Fetched users:', users);
      console.log('SBT address:', sbtAddress);
      
      const otherUsers = users.filter((user: any) => 
        user.walletAddress.toLowerCase() !== currentUserWallet?.toLowerCase()
      );
      console.log('Filtered other users:', otherUsers);

      const allNftsPromises = otherUsers.map(async (user: any) => {
        console.log('Fetching NFTs for user:', user.username);
        const query = `
          query MyQuery {
            current_token_ownerships_v2(
              offset: 0
              where: {
                owner_address: {_eq: "${user.walletAddress}"},
                current_token_data: {
                  collection_id: {_eq: "${sbtAddress}"}
                }
              }
            ) {
              owner_address
              current_token_data {
                collection_id
                token_name
                current_collection {
                  collection_name
                }
                token_uri
              }
            }
          }
        `;

        const response = await fetch(
          "https://aptos-testnet.nodit.io/zIcivJ82QDnhpUOOfD4ukhm_8To~tqiC/v1/graphql",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          }
        );

        const result = await response.json();
        console.log('GraphQL result for user:', user.username, result);
        
        // Fetch metadata for each NFT
        const nftsWithMetadata = await Promise.all(
          result.data.current_token_ownerships_v2.map(async (nft: any) => {
            console.log('Fetching metadata for NFT:', nft.current_token_data.token_name);
            const metadata = await fetchMetadata(nft.current_token_data.token_uri);
            return {
              ...nft,
              metadata
            };
          })
        );

        console.log('NFTs with metadata for user:', user.username, nftsWithMetadata);
        return {
          username: user.username,
          nfts: nftsWithMetadata
        };
      });

      const results = await Promise.all(allNftsPromises);
      console.log('Final results:', results);
      setAllNfts(results);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('BattleView component mounted');
    fetchAllUserNfts();
  }, []);

  if (loading) {
    return <div className="text-white text-center">Loading battle cards...</div>;
  }

  console.log('Rendering battle cards with NFTs:', allNfts);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allNfts.map((userNfts, userIndex) => (
        userNfts.nfts.map((nft: any, nftIndex: number) => (
          <motion.div
            key={`${userIndex}-${nftIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (userIndex * 0.1) + (nftIndex * 0.05) }}
            className="bg-[#1E293B] rounded-xl p-6 border border-purple-600"
          >
            <div className="flex flex-col gap-4">
              {nft.metadata?.image && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={nft.metadata.image}
                    alt={nft.current_token_data.token_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-[#F59E0B]">
                {nft.current_token_data.token_name}
              </h3>
              <p className="text-white">Owner: {userNfts.username}</p>
              <p className="text-white">
                Collection: {nft.current_token_data.current_collection.collection_name}
              </p>
              <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Challenge to Battle
              </button>
            </div>
          </motion.div>
        ))
      ))}
    </div>
  );
} 