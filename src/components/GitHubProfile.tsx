import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, GitFork, Users, MapPin, Building, Code2, Trophy, Activity, Zap, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { IoLogoJavascript, IoLogoPython } from "react-icons/io5";
import { FaJava } from "react-icons/fa";

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
}

export const GitHubProfile = ({ username }: GitHubProfileProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    if (username) {
      fetchGitHubData();
    }
  }, [username]);

  const saveAsImage = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        backgroundColor: '#1E293B',
      });
      
      const link = document.createElement('a');
      link.download = `${username}-github-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error saving image:', err);
    }
  };

  const getDevTypeConfig = (devType: string) => {
    switch (devType) {
      case 'JSDev':
        return {
          primary: '#F7DF1E', // JavaScript Yellow
          secondary: '#323330', // JavaScript Dark
          icon: <IoLogoJavascript className="w-8 h-8" />
        };
      case 'PythonDev':
        return {
          primary: '#3776AB', // Python Blue
          secondary: '#FFD43B', // Python Yellow
          icon: <IoLogoPython className="w-8 h-8" />
        };
      case 'JavaDev':
        return {
          primary: '#ED8B00', // Java Orange
          secondary: '#5382A1', // Java Blue
          icon: <FaJava className="w-8 h-8" />
        };
      default:
        return {
          primary: '#6D28D9',
          secondary: '#F59E0B',
          icon: null
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#6D28D9]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 rounded-lg bg-red-100/10">
        Could not find GitHub profile for username: {username}
      </div>
    );
  }

  if (!githubData) return null;

  const devConfig = getDevTypeConfig('JSDev');

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        ref={cardRef}
        className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-opacity-30"
        style={{ borderColor: devConfig.primary }}
      >
        {/* ID Card Header */}
        <div className="text-center border-b pb-4 mb-4" style={{ borderColor: `${devConfig.primary}40` }}>
          <div className="flex items-center justify-center gap-2">
            {devConfig.icon}
            <h1 className="text-lg font-bold" style={{ color: devConfig.primary }}>
               DevX Card
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Profile Photo with updated glow color */}
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-50"
              style={{ background: `linear-gradient(to right, ${devConfig.primary}, ${devConfig.secondary})` }}
            ></div>
            <img
              src={githubData.avatar_url}
              alt={`${githubData.name || username}'s avatar`}
              className="relative w-32 h-32 rounded-full border-4"
              style={{ borderColor: devConfig.primary }}
            />
          </motion.div>

          {/* Basic Info */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white">{githubData.name || username}</h2>
            {/* <p className="text-gray-400 text-sm mt-1">{githubData.bio}</p> */}
          </div>

          {/* Details Grid */}
          <div className="w-full space-y-2">
            {/* <div className="flex items-center gap-2 text-white">
              <Building className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-gray-400">Company:</span>
              <span>{githubData.company || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-gray-400">Location:</span>
              <span>{githubData.location || 'N/A'}</span>
            </div> */}
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-gray-400">Followers/Following:</span>
              <span>{githubData.followers}/{githubData.following}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Book className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-gray-400">Repositories:</span>
              <span>{githubData.public_repos}</span>
            </div>
          </div>

          {/* Language Section */}
          {githubData.top_languages?.length > 0 && (
            <div className="w-full mt-4 pt-4 border-t border-[#6D28D9]/30">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white font-semibold">Top Languages</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {githubData.top_languages.slice(0, 3).map(({ language, percentage }) => (
                  <div
                    key={language}
                    className="bg-[#0F172A] px-2 py-1 rounded-full text-sm"
                  >
                    <span className="text-white">{language} </span>
                    <span className="text-gray-400">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Download Button */}
      <button
        onClick={saveAsImage}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-[#6D28D9] transition-colors duration-200"
        title="Save as image"
      >
        <Download className="w-5 h-5 text-[#F59E0B]" />
        <span className="text-white">Save as Image</span>
      </button>
    </div>
  );
}; 