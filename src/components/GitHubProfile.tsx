import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, GitFork, Users, MapPin, Building } from 'lucide-react';

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
    console.log('Loading GitHub data...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.log('Error state:', error);
    return (
      <div className="text-red-500 text-center p-4 rounded-lg bg-red-100/10">
        Could not find GitHub profile for username: {username}
      </div>
    );
  }

  if (!githubData) {
    console.log('No GitHub data available');
    return null;
  }

  console.log('Rendering GitHub profile for:', githubData.name || username);
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Image and Basic Info */}
        <div className="flex flex-col items-center">
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={githubData.avatar_url}
            alt={`${githubData.name || username}'s avatar`}
            className="w-32 h-32 rounded-full border-2 border-gray-700"
          />
          <h2 className="text-2xl font-bold mt-4 text-white">{githubData.name || username}</h2>
          {githubData.bio && <p className="text-gray-400 mt-2 text-center">{githubData.bio}</p>}
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-5 h-5" />
              <span>{githubData.followers} followers · {githubData.following} following</span>
            </div>
            {githubData.location && (
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>{githubData.location}</span>
              </div>
            )}
            {githubData.company && (
              <div className="flex items-center gap-2 text-gray-300">
                <Building className="w-5 h-5" />
                <span>{githubData.company}</span>
              </div>
            )}
          </div>

          {/* Repositories */}
          {githubData.last_15_repositories?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-white">Latest Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {githubData.last_15_repositories.map((repo) => (
                  <motion.div
                    key={repo.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-white font-medium">{repo.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 mr-1" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        {repo.fork && (
                          <GitFork className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-gray-400 text-sm mt-2">{repo.description}</p>
                    )}
                    {repo.language && (
                      <div className="mt-2 text-sm text-gray-300">
                        <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span>
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
    </div>
  );
}; 