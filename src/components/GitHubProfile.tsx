import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, GitFork, Users, MapPin, Building, Code2, Trophy, Activity, Zap, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { IoLogoJavascript, IoLogoPython } from "react-icons/io5";
import { FaJava } from "react-icons/fa";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IndexerClient } from "aptos";

interface GitHubProfileProps {
  username: string;
}

interface GitHubData {
  name: string;
  avatar_url: string;
  bio: string;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  last_15_repositories: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    fork: boolean;
  }>;
  top_languages: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  developer_type: string;
  profile_readme: string | null;
}

export const GitHubProfile = ({ username }: GitHubProfileProps) => {
  console.log('GitHubProfile component rendered with username:', username);
  
  const { account } = useWallet();
  const cardRef = useRef<HTMLDivElement>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sbtData, setSbtData] = useState<any>("");
  const [hasSbt, setHasSbt] = useState(false);

  // Add wallet address from localStorage
  const walletAddress = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).walletAddress : '';

  useEffect(() => {
    console.log('useEffect triggered - checking SBT and fetching data');
    const checkSbtAndFetchData = async () => {
      try {
        // Check if user has SBT first
        console.log('Checking if user has SBT for username:', username);
        const response = await fetch('/api/check-sbt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        console.log('SBT check response:', data);
        
        if (data.hasSbt) {
          console.log('User has SBT, fetching NFT data');
          setHasSbt(true);
          await fetchNFTs();
        } else {
          console.log('User does not have SBT, fetching GitHub data');
        //   await fetchGitHubData();
        }
      } catch (err) {
        console.error('Error checking SBT status:', err);
        // await fetchGitHubData(); // Fallback to GitHub data
        //getting issues
      }
    };

    checkSbtAndFetchData();
  }, [username, account?.address]);

  const fetchNFTs = async () => {
    console.log('Fetching NFTs for account:', account?.address);
     {
      const query = `
        query MyQuery {
          current_token_ownerships_v2(
            offset: 0
            where: {owner_address: {_eq: "${walletAddress}"}}
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

      try {
        console.log('Making GraphQL request to fetch NFTs');
        const response = await fetch(
          "https://aptos-testnet.nodit.io/zIcivJ82QDnhpUOOfD4ukhm_8To~tqiC/v1/graphql",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        const result = await response.json();
        console.log('NFT data received:', result);
        if (result.data?.current_token_ownerships_v2?.length > 0) {
          console.log('Setting SBT data');
          // Parse the data properly before setting it
          setSbtData(result.data); // Changed this line to set the entire data object
          
          // Log the details of all SBTs
          result.data.current_token_ownerships_v2.forEach((sbt: any, index: number) => {
            console.log(`SBT ${index + 1}:`, {
              tokenName: sbt.current_token_data.token_name,
              collectionName: sbt.current_token_data.current_collection.collection_name,
              tokenUri: sbt.current_token_data.token_uri
            });
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError('Failed to fetch NFT data');
        setLoading(false);
      }
    }
  };

  

  

  const fetchGitHubData = async () => {
    console.log(`Fetching GitHub data for username: ${username}`);
    try {
      const response = await fetch(`/api/github?username=${username}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error fetching GitHub data:', data.message || 'Failed to fetch GitHub data');
        throw new Error(data.message || 'Failed to fetch GitHub data');
      }
      
      console.log('GitHub data fetched successfully:', data);
      setGithubData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error occurred:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Fetch GitHub data process completed');
    }
  };

  const saveAsImage = async () => {
    console.log('Starting SBT minting process');
    if (cardRef.current === null || !githubData) {
      console.log('Missing required data - cardRef or githubData is null');
      return;
    }
    
    try {
      const { imageUrl, metadataUrl } = await uploadImageAndMetadata();
      
      const mintPayload = {
        wallet: walletAddress,
        username: username,
        nft_uri: metadataUrl,
        properties: Array.isArray(githubData.top_languages) 
          ? githubData.top_languages.map(lang => ({
              label: lang.language,
              value: lang.percentage.toString()
            }))
          : [] // Provide empty array as fallback
      };
      console.log('Preparing mint request with payload:', mintPayload);

      console.log('Initiating SBT minting transaction...');
      const mintResponse = await fetch('http://172.16.156.117:5000/api/mint-sbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintPayload),
      });

      const mintResult = await mintResponse.json();
      console.log('SBT Minting transaction details:', mintResult);
      console.log('Transaction hash:', mintResult.transactionHash);
      console.log('Token ID:', mintResult.tokenId);
      
      // After successful minting
      const updateSbtResponse = await fetch('/api/update-sbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          sbtAddress: mintResult.collection_address
        })
      });

      const updateResult = await updateSbtResponse.json();
      console.log('SBT address updated:', updateResult);

      return {
        imageUrl,
        metadataUrl,
        mintResult
      };

    } catch (err) {
      console.error('SBT Minting failed:', err);
      console.error('Error details:', err instanceof Error ? err.message : err);
    }
  };

  const uploadImageAndMetadata = async () => {
    console.log('Starting image and metadata upload process');
    const dataUrl = await htmlToImage.toPng(cardRef.current!, {
      quality: 1.0,
      backgroundColor: '#1E293B',
    });
    
    console.log('Image generated, uploading to server');
    const imageResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData: dataUrl }),
    });

    const imageData = await imageResponse.json();
    console.log('Image upload response:', imageData);
    
    if (imageData.error) {
      throw new Error(imageData.error);
    }

    const metadata = {
      name: githubData.name || username,
      description: `DevX SBT for ${githubData.name || username}`,
      image: imageData.imageUrl,
      attributes: [
        {
          trait_type: "Bio",
          value: githubData.bio || ""
        },
        {
          trait_type: "Location",
          value: githubData.location || ""
        },
        {
          trait_type: "Company",
          value: githubData.company || ""
        },
        {
          trait_type: "Followers",
          value: githubData.followers
        },
        {
          trait_type: "Following",
          value: githubData.following
        },
        {
          trait_type: "Public Repositories",
          value: githubData.public_repos
        },
        {
          trait_type: "Top Languages",
          value: githubData.top_languages?.map(lang => `${lang.language} (${lang.percentage}%)`).join(", ") || ""
        },
        {
          trait_type: "Developer Type",
          value: githubData.developer_type || ""
        },
        {
          trait_type: "GitHub README",
          value: githubData.profile_readme || "No README available"
        },
        {
          trait_type: "Last Updated",
          value: new Date().toISOString()
        }
      ]
    };

    console.log('Uploading metadata:', metadata);
    const metadataResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        jsonData: metadata
      }),
    });

    const metadataResult = await metadataResponse.json();
    console.log('Metadata upload response:', metadataResult);
    
    return {
      imageUrl: imageData.imageUrl,
      metadataUrl: metadataResult.imageUrl
    };
  };

  const getDevTypeConfig = (devType: string) => {
    console.log('Getting dev type config for:', devType);
    switch (devType) {
      case 'JSDev':
        return {
          primary: '#F7DF1E', // JavaScript Yellow
          secondary: '#323330', // JavaScript Dark
          icon: <IoLogoJavascript className="w-8 h-8" />,
          gradient: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)'
        };
      case 'PythonDev':
        return {
          primary: '#3776AB', // Python Blue
          secondary: '#FFD43B', // Python Yellow
          icon: <IoLogoPython className="w-8 h-8" />,
          gradient: 'linear-gradient(145deg, #1e2936 0%, #2b3f54 100%)'
        };
      case 'JavaDev':
        return {
          primary: '#ED8B00', // Java Orange
          secondary: '#5382A1', // Java Blue
          icon: <FaJava className="w-8 h-8" />,
          gradient: 'linear-gradient(145deg, #2b2320 0%, #3d2f28 100%)'
        };
      default:
        return {
          primary: '#6D28D9',
          secondary: '#F59E0B',
          icon: null,
          gradient: 'linear-gradient(145deg, #1E293B 0%, #1E293B 100%)'
        };
    }
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="text-white text-center p-4">
        Loading...  
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="text-red-500 text-center p-4 rounded-lg bg-red-100/10">
        {error}
      </div>
    );
  }

  if (hasSbt && sbtData) {
    console.log('Rendering SBT view with data:', sbtData);
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.div 
          className="rounded-xl p-6 shadow-lg border border-purple-600 bg-[#1E293B]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Your DevX SBTs</h2>
          <div className="space-y-6">
            {/* Add optional chaining and ensure we're accessing the correct property */}
            {sbtData?.current_token_ownerships_v2?.map((sbt: any, index: number) => (
              <div key={index} className="p-4 border border-purple-500 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <p className="text-white">Collection: {sbt.current_token_data.current_collection.collection_name}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <p className="text-white">Token Name: {sbt.current_token_data.token_name}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <p className="text-white break-all">Token URI: {sbt.current_token_data.token_uri}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Return existing GitHub profile UI if no SBT
  if (!githubData) {
    console.log('No GitHub data available, returning null');
    return null;
  }

  console.log('Rendering GitHub profile view');
  const devConfig = getDevTypeConfig(githubData.developer_type);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        ref={cardRef}
        className="rounded-xl p-6 shadow-lg border border-opacity-30 max-w-md w-full"
        style={{ 
          borderColor: devConfig.primary,
          background: devConfig.gradient
        }}
      >
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: devConfig.primary }}>
            My DevX SBT
          </h1>
        </div>

        {/* SBT Display */}
        <div className="flex flex-col items-center">
          {/* Add SBT visualization here */}
          <p className="text-white mt-4">SBT Address: {sbtAddress}</p>
          {/* Add other SBT metadata display */}
        </div>
      </motion.div>
    </div>
  );
}; 