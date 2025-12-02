import { NextResponse } from 'next/server';

/**
 * GET /api/joke/categories
 *
 * Get available joke categories
 *
 * Response:
 * {
 *   "categories": string[],
 *   "success": true
 * }
 */
export async function GET() {
  const categories = [
    {
      id: 'puns',
      name: 'Puns & Wordplay',
      description: 'Clever wordplay and punny jokes'
    },
    {
      id: 'dad',
      name: 'Dad Jokes',
      description: 'Classic groan-worthy dad humor'
    },
    {
      id: 'knock-knock',
      name: 'Knock-Knock Jokes',
      description: 'The classic knock-knock format'
    },
    {
      id: 'one-liner',
      name: 'One-Liners',
      description: 'Quick and witty one-line jokes'
    },
    {
      id: 'programming',
      name: 'Programming Jokes',
      description: 'Jokes about coding and technology'
    },
    {
      id: 'animal',
      name: 'Animal Jokes',
      description: 'Jokes about our furry and feathered friends'
    },
    {
      id: 'food',
      name: 'Food Jokes',
      description: 'Deliciously funny food-related humor'
    },
    {
      id: 'science',
      name: 'Science Jokes',
      description: 'Jokes for the scientifically inclined'
    }
  ];

  return NextResponse.json({
    categories,
    success: true,
  });
}
