'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState('');

  const extractVideoId = (url: string) => {
    // Regular expression to match YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      toast.error('Please enter a valid YouTube video URL');
      setIsSubmitting(false);
      return;
    }

    console.log('YouTube Video ID:', videoId);
    
    try {
      const response = await fetch(`https://deserving-harmony-9f5ca04daf.strapiapp.com/utilai/yt-transcript/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.text();
      setTranscript(data);
      toast.success('Transcript fetched successfully!');
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast.error('Failed to fetch transcript');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL
            </label>
            <input
              type="text"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Fetching Transcript...' : 'Get Transcript'}
          </button>
        </form>

        {transcript && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Transcript</h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{transcript}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 