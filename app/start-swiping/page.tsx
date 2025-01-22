'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HeartIcon } from '@heroicons/react/24/solid'

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface AIProfile {
  uuid: string;
  id: number;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
}

interface SwipeData {
  profileUuid: string;
  direction: 'left' | 'right';
}

interface SwipeResult {
  name: string;
  uuid: string;
  status: 'accepted' | 'rejected';
}

async function fetchProfiles(): Promise<AIProfile[]> {
  const response = await fetch('/api/profiles');
  if (!response.ok) {
    throw new Error('Failed to fetch profiles');
  }
  return response.json();
}

async function getMatches(): Promise<SwipeResult[]> {
  const response = await fetch('/api/get-matches');
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
}

async function sendSwipeVerdict(swipe: SwipeData): Promise<void> {
  const response = await fetch('/api/on-swipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ swipeData: swipe }),
  });
  if (!response.ok) {
    throw new Error('Failed to send swipe verdict');
  }
  console.log('Swipe verdict sent successfully');
}

export default function StartSwiping() {
  const [profiles, setProfiles] = useState<AIProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [swipeResults, setSwipeResults] = useState<SwipeResult[]>([]);
  const [swipes, setSwipes] = useState<SwipeData[]>([]);
  console.log('swipes:', typeof swipes, swipes);
  if (swipes.length > 0){
  console.log('profiles:', swipes[0].direction);
  } 
  useEffect(() => {
    async function loadProfiles() {
      try {
        const fetchedProfiles = await fetchProfiles();
        setProfiles(fetchedProfiles);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load profiles. Please try again later.' + err);
        setIsLoading(false);
      }
    }

    loadProfiles();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    console.log(`Swiping ${direction}`);
    if (currentProfileIndex >= profiles.length) return;

    const currentProfile = profiles[currentProfileIndex];
    const newSwipe: SwipeData = { profileUuid: currentProfile.uuid, direction };
    setSwipes(prevSwipes => [...prevSwipes, newSwipe]);
    try {
      await sendSwipeVerdict(newSwipe);
    } catch (err) {
      console.error('Failed to send swipe verdict:', err);
      setError('Failed to send swipe verdict. Please try again.');
    }

    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex((prev) => prev + 1);
    } else {
      try {
        console.log('Fetching matches');
        const results = await getMatches();
        console.log('Matches:', results);
        setSwipeResults(results);
        setShowResults(true);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
        setError('Failed to fetch matches. Please try again.');
      }
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (showResults) {
    return <Results results={swipeResults} />;
  }

  if (profiles.length === 0 || currentProfileIndex >= profiles.length) {
    return <div className="min-h-screen flex items-center justify-center">No more profiles available</div>;
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-100 via-rose-50 to-earth-100">
      <header className="bg-ivory-200 bg-opacity-90 shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-earth-700">Galatea.AI</Link>
          <Button variant="ghost" className="text-earth-700 hover:text-rose-700" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-earth-800 mb-8 text-center">Start Swiping</h1>
        
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="relative aspect-[3/4] mb-4">
                <Image
                  src={currentProfile.imageUrl}
                  alt={currentProfile.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>

              <div className="flex justify-center space-x-4 mt-6 mb-6">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full p-4"
                  onClick={() => handleSwipe('left')}
                >
                  <XIcon className="h-8 w-8 text-rose-500" />
                  <span className="sr-only">Swipe Left</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full p-4"
                  onClick={() => handleSwipe('right')}
                >
                  <HeartIcon className="h-8 w-8 text-rose-500" />
                  <span className="sr-only">Swipe Right</span>
                </Button>
              </div>
              
              <h2 className="text-2xl font-semibold text-earth-800">{currentProfile.name}, {currentProfile.age}</h2>
              <p className="text-earth-600 mt-2">{currentProfile.bio}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-earth-100 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-earth-700">
            © 2024 Galatea.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function Results({ results }: { results: SwipeResult[] }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-100 via-rose-50 to-earth-100">
      <header className="bg-ivory-200 bg-opacity-90 shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-earth-700">Galatea.AI</Link>
          <Button variant="ghost" className="text-earth-700 hover:text-rose-700" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-earth-800 mb-8 text-center">Your Swipe Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card key={result.uuid} className="w-full">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-earth-800">{result.name}</h2>
                <p className="text-earth-600 mt-2">UUID: {result.uuid}</p>
                <p className={`mt-2 ${result.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {result.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="bg-earth-100 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-earth-700">
            © 2024 Galatea.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}