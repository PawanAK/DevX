import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, GitFork, Users, MapPin, Building, Code2, Trophy, Activity, Zap } from 'lucide-react';

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
}

export const GitHubProfile = ({ username }: GitHubProfileProps) => {
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

  // Calculate battle stats
  const battleScore = Math.floor(
    (githubData.followers * 2) + 
    (githubData.public_repos * 5) + 
    (githubData.last_15_repositories?.reduce((acc, repo) => acc + repo.stargazers_count, 0) || 0)
  );

  return (
    <motion.div 
      className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-[#6D28D9]/30"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Battle Stats Banner */}
      <div className="bg-gradient-to-r from-[#6D28D9] to-[#4C1D95] rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#F59E0B]" />
            <span className="text-white font-bold text-xl">Battle Score: {battleScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-white">Rank: Elite Developer</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] rounded-full blur-md opacity-50"></div>
            <img
              src={githubData.avatar_url}
              alt={`${githubData.name || username}'s avatar`}
              className="relative w-32 h-32 rounded-full border-4 border-[#6D28D9]"
            />
          </motion.div>
          <h2 className="text-2xl font-bold mt-4 text-white">{githubData.name || username}</h2>
          {githubData.bio && (
            <p className="text-gray-400 mt-2 text-center max-w-xs">{githubData.bio}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0F172A] p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-white font-semibold">Following Power</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {githubData.followers} / {githubData.following}
              </p>
            </div>
            <div className="bg-[#0F172A] p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-white font-semibold">Repository Count</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{githubData.public_repos}</p>
            </div>
          </div>

          {/* Language Powers */}
          {githubData.top_languages?.length > 0 && (
            <div className="bg-[#0F172A] p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-white font-semibold">Language Powers</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {githubData.top_languages.map(({ language, percentage }) => (
                  <div
                    key={language}
                    className="bg-[#1E293B] px-3 py-1.5 rounded-full flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                    <span className="text-white">{language}</span>
                    <span className="text-gray-400 text-sm">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Repositories */}
          {githubData.last_15_repositories?.length > 0 && (
            <div className="bg-[#0F172A] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#F59E0B]" />
                Top Arsenal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {githubData.last_15_repositories.slice(0, 4).map((repo) => (
                  <motion.div
                    key={repo.name}
                    className="bg-[#1E293B] p-3 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium truncate">{repo.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#F59E0B] flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {repo.stargazers_count}
                        </span>
                      </div>
                    </div>
                    {repo.language && (
                      <div className="mt-2 text-sm text-gray-400">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#6D28D9] mr-2"></span>
                        {repo.language}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 