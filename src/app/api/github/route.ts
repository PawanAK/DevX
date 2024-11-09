import { NextRequest, NextResponse } from 'next/server';

interface GitHubProfile {
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  open_issues_count: number;
  license: any;
  fork: boolean;
}

async function getUserDetails(username: string) {
  let profileResponse: GitHubProfile | null = null;
  let readmeContent: string = '';
  let repoResponse: GitHubRepo[] = [];

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    profileResponse = await response.json();

    if (!response.ok || !profileResponse) {
      throw new Error('Profile not found');
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Could not fetch profile');
  }

  try {
    const readmeResponse = await fetch(`https://raw.githubusercontent.com/${username}/${username}/master/README.md`);
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text();
    }
  } catch (error) {
    console.error('Error fetching README:', error);
    readmeContent = '';
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
    repoResponse = await response.json();

    if (!response.ok || !repoResponse) {
      throw new Error('Repositories not found');
    }
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw new Error('Could not fetch repositories');
  }

  return {
    name: profileResponse.name,
    avatar_url: profileResponse.avatar_url,
    bio: profileResponse.bio,
    company: profileResponse.company,
    location: profileResponse.location,
    followers: profileResponse.followers,
    following: profileResponse.following,
    public_repos: profileResponse.public_repos,
    profile_readme: readmeContent,
    last_15_repositories: repoResponse
      .slice(0, 15)
      .map((repo: GitHubRepo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        fork: repo.fork,
      })),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    const githubData = await getUserDetails(username);
    return NextResponse.json(githubData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error fetching GitHub data' },
      { status: 500 }
    );
  }
}