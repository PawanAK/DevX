import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { challenger, defender } = await req.json();

    // Extract relevant attributes from NFT metadata
    const challengerAttributes = challenger.nftData.attributes || [];
    
    // Get defender's NFT data using GraphQL
    const defenderNftData = await fetchDefenderNFT(defender.walletAddress);
    
    // Prepare battle context for AI
    const battleContext = `
      Challenger (${challenger.username}):
      
      Attributes: ${JSON.stringify(challengerAttributes)}

      Defender (${defender.username}):

      Attributes: ${JSON.stringify(defenderNftData.attributes)}
    `;

    // Use Claude to determine battle outcome
    const completion = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Based on these two NFTs and their attributes, create a short brutal roast (max 100 words) where one NFT mocks the other:
          ${battleContext}
          
          Format the response as:
          Winner: [username]
          Roast: [brutal but funny roast from winner to loser]`
      }]
    });

    const result = completion.content[0].text;

    return NextResponse.json({
      battleResult: result,
      challenger: challenger.username,
      defender: defender.username
    });

  } catch (error) {
    console.error('Battle error:', error);
    return NextResponse.json({ error: 'Battle failed' }, { status: 500 });
  }
}

async function fetchDefenderNFT(walletAddress: string) {
  // Your existing GraphQL query implementation here
  // Similar to the query you provided
  const query = `query MyQuery {
    current_token_ownerships_v2(
      offset: 0
      where: {
        owner_address: {_eq: "${walletAddress}"}
      }
    ) {
      owner_address
      current_token_data {
        collection_id
        token_name
        token_uri
      }
    }
  }`;

  const response = await fetch(
    "https://aptos-testnet.nodit.io/zIcivJ82QDnhpUOOfD4ukhm_8To~tqiC/v1/graphql",
    {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    }
  );

  const result = await response.json();
  
  if (!result.data?.current_token_ownerships_v2?.length) {
    throw new Error('No NFTs found for defender');
  }

  // Get the first NFT owned by defender
  const nft = result.data.current_token_ownerships_v2[0];
  
  // Fetch metadata for the NFT
  const metadata = await fetch(nft.current_token_data.token_uri).then(res => res.json());

  return {
    tokenId: nft.current_token_data.token_name,
    tokenUri: nft.current_token_data.token_uri,
    metadata
  };
} 