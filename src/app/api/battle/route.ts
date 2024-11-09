import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';


const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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

// Add new interfaces for NFT battle
interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTMetadata {
  name: string;
  image: string;
  attributes: NFTAttribute[];
}

// Add new function to fetch NFT metadata
async function fetchNFTMetadata(tokenUri: string): Promise<NFTMetadata> {
  try {
    const response = await fetch(tokenUri);
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw new Error('Could not fetch NFT metadata');
  }
}

// Add new function to calculate NFT battle score
function calculateNFTScore(metadata: NFTMetadata): number {
  let score = 0;
  
  // Calculate score based on attributes
  metadata.attributes.forEach(attr => {
    if (typeof attr.value === 'number') {
      score += attr.value;
    } else if (typeof attr.value === 'string') {
      // Convert string values to numbers based on length or other criteria
      score += attr.value.length;
    }
  });

  return Math.min(Math.round(score), 100); // Cap score at 100
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

  console.log('Profile Data:', profileResponse);

  try {
    const readmeResponse = await fetch(`https://raw.githubusercontent.com/${username}/${username}/master/README.md`);
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text();
    } else {
      readmeContent = 'No README found';
    }
  } catch (error) {
    console.error('Error fetching README:', error);
    readmeContent = 'Could not fetch README';
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

  console.log('Repository Data:', repoResponse);

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
        open_issues_count: repo.open_issues_count,
        license: repo.license,
        fork: repo.fork,
      })),
  };
}

// Modify the existing GET function to handle both GitHub and NFT battles
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username1 = searchParams.get('username1');
  const username2 = searchParams.get('username2');
  const battleType = searchParams.get('type') || 'github'; // 'github' or 'nft'
  const nftUri1 = searchParams.get('nftUri1');
  const nftUri2 = searchParams.get('nftUri2');

  if (battleType === 'nft') {
    if (!nftUri1 || !nftUri2) {
      return NextResponse.json({ error: 'Both NFT URIs are required' }, { status: 400 });
    }

    try {
      // Fetch NFT metadata for both NFTs
      const [nft1Metadata, nft2Metadata] = await Promise.all([
        fetchNFTMetadata(nftUri1),
        fetchNFTMetadata(nftUri2)
      ]);

      // Calculate scores
      const score1 = calculateNFTScore(nft1Metadata);
      const score2 = calculateNFTScore(nft2Metadata);

      // Generate battle narrative using Claude
      const nftBattlePrompt = `Create an epic battle narrative between these two NFTs:

NFT 1 (${nft1Metadata.name}):
Attributes: ${JSON.stringify(nft1Metadata.attributes)}
Score: ${score1}

NFT 2 (${nft2Metadata.name}):
Attributes: ${JSON.stringify(nft2Metadata.attributes)}
Score: ${score2}

Create a dramatic battle story in about 100 words. Make it entertaining and reference their attributes.`;

      const completion = await anthropicClient.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: nftBattlePrompt }],
      });

      const battleResult = completion.content[0].text;

      // Determine winner and loser
      const winner = score1 > score2 ? username1 : username2;
      const loser = score1 > score2 ? username2 : username1;
      const winnerScore = Math.max(score1, score2);
      const loserScore = Math.min(score1, score2);

      const battleData = {
        username1,
        username2,
        battleResult,
        nft1: {
          name: nft1Metadata.name,
          image: nft1Metadata.image,
          score: score1
        },
        nft2: {
          name: nft2Metadata.name,
          image: nft2Metadata.image,
          score: score2
        },
        winner,
        loser,
        winnerScore,
        loserScore,
        type: 'nft',
        timestamp: Date.now()
      };

      return NextResponse.json(battleData);

    } catch (error: any) {
      console.error('Error in NFT battle:', error);
      return NextResponse.json({ error: `NFT battle failed: ${error.message}` }, { status: 500 });
    }
  } else {
    // Existing GitHub battle logic
    if (!username1 || !username2) {
      return NextResponse.json({ error: 'Both usernames are required' }, { status: 400 });
    }

    let userDetails1, userDetails2;
    try {
      userDetails1 = await getUserDetails(username1);
      userDetails2 = await getUserDetails(username2);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      return NextResponse.json({ error: `Failed to fetch user details: ${error.message}` }, { status: 404 });
    }

    const prompt = `Compare the following GitHub profiles and declare a winner and loser with a harsh and sarcastic tone:

**${username1}**: ${JSON.stringify(userDetails1)}
**${username2}**: ${JSON.stringify(userDetails2)}

Respond in the following format:
Winner: [username] (Score: X/100) | Loser: [username] (Score: Y/100)
[Your harsh, sarcastic roast comparing the two users in about 100 words]`;

    let battleResult: string = '';
    let winner: string = '';
    let loser: string = '';
    let winnerScore: number = 0;
    let loserScore: number = 0;

    try {
      const completion = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const contentArray = completion.content as { type: string; text: string }[];
      const fullResponse = contentArray[0].text || 'Could not generate comparison.';

      // Parse the AI response to extract winner, loser, and scores
      const lines = fullResponse.split('\n');
      const resultLine = lines[0];
      const resultMatch = resultLine.match(/Winner: (\w+) \(Score: (\d+)\/100\) \| Loser: (\w+) \(Score: (\d+)\/100\)/i);

      if (resultMatch) {
        winner = resultMatch[1];
        winnerScore = parseInt(resultMatch[2]);
        loser = resultMatch[3];
        loserScore = parseInt(resultMatch[4]);

        // Remove the result line from the battle result
        battleResult = lines.slice(1).join('\n').trim();
      } else {
        console.error('Failed to parse result line:', resultLine);
        battleResult = fullResponse;
        winner = '';
        loser = '';
        winnerScore = 0;
        loserScore = 0;
      }
    } catch (error: any) {
      console.error('Error generating comparison:', error);
      return NextResponse.json({ error: `Failed to generate comparison: ${error.message}` }, { status: 500 });
    }

    console.log('Generated Battle Result:', battleResult);

    const battleData = {
      username1,
      username2,
      battleResult,
      name1: userDetails1.name,
      avatar_url1: userDetails1.avatar_url,
      name2: userDetails2.name,
      avatar_url2: userDetails2.avatar_url,
      winner,
      loser,
      winnerScore,
      loserScore,
      type: '1v1',
      timestamp: Date.now()
    };
    console.log('Battle Data:', battleData);
    const comparisonId = `${username1}_vs_${username2}`;
 

    return NextResponse.json(battleData);
  }
}

// Add POST endpoint for initiating battles
export async function POST(req: NextRequest) {
  try {
    const { challenger, defender } = await req.json();

    // Validate request
    if (!challenger || !defender) {
      return NextResponse.json({ error: 'Both challenger and defender are required' }, { status: 400 });
    }

    // Redirect to GET endpoint with appropriate parameters
    const searchParams = new URLSearchParams({
      username1: challenger.username,
      username2: defender.username,
      type: 'nft',
      nftUri1: challenger.nftUri,
      nftUri2: defender.nftUri
    });

    // Create internal request to GET endpoint
    const response = await GET(
      new Request(`${req.url}?${searchParams.toString()}`, {
        method: 'GET',
        headers: req.headers
      })
    );

    return response;

  } catch (error: any) {
    console.error('Error processing battle request:', error);
    return NextResponse.json({ error: `Battle request failed: ${error.message}` }, { status: 500 });
  }
}
