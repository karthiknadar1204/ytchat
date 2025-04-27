'use client';

import { useRouter } from 'next/navigation';
import { SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { StoreUser } from '@/app/actions/user';

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  
  console.log("User:", user);
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          console.log("Attempting to sync user:", user);
          const result = await StoreUser({
            id: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: user.fullName,
          });
          
          if (!result) {
            setError("Failed to store user data");
            console.error("Failed to store user data");
          } else {
            console.log("User sync successful:", result);
          }
        } catch (err) {
          setError("Error syncing user data");
          console.error("Error in syncUser:", err);
        }
      }
    };

    if (isLoaded) {
      syncUser();
    }
  }, [user, isLoaded]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to YTChat</h1>
        <p className="text-xl mb-8 text-center">
          Your AI-powered YouTube chat assistant
        </p>
        {error && (
          <div className="text-red-500 mb-4 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Get Started
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button
              onClick={handleGetStarted}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </SignedIn>
        </div>
      </div>
    </main>
  );
}
