'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { encode, isWithinTokenLimit } from 'gpt-tokenizer';

export default function DashboardPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chunks, setChunks] = useState<string[]>([]);

  const extractVideoId = (url: string) => {
    // Regular expression to match YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const createChunks = (text: string, maxTokens: number = 4000, overlapTokens: number = 200) => {
    const chunks: string[] = [];
    let currentChunk = '';
    let currentTokens = 0;
    let overlapBuffer = '';

    // Split text into sentences (simple split on period for now)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
      const sentenceTokens = encode(sentence).length;
      
      if (currentTokens + sentenceTokens > maxTokens) {
        // If adding this sentence would exceed the limit, save current chunk
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          
          // Set up overlap for next chunk
          const words = currentChunk.split(' ');
          let overlapText = '';
          let overlapTokenCount = 0;
          
          // Build overlap from the end of the current chunk
          for (let i = words.length - 1; i >= 0; i--) {
            const wordTokens = encode(words[i]).length;
            if (overlapTokenCount + wordTokens > overlapTokens) break;
            overlapText = words[i] + ' ' + overlapText;
            overlapTokenCount += wordTokens;
          }
          
          overlapBuffer = overlapText.trim();
          currentChunk = overlapBuffer;
          currentTokens = encode(overlapBuffer).length;
        }
        
        // If a single sentence is too long, split it into smaller parts
        if (sentenceTokens > maxTokens) {
          const words = sentence.split(' ');
          let tempChunk = overlapBuffer;
          let tempTokens = encode(overlapBuffer).length;
          
          for (const word of words) {
            const wordTokens = encode(word).length;
            if (tempTokens + wordTokens > maxTokens) {
              chunks.push(tempChunk.trim());
              
              // Set up overlap for next chunk
              const tempWords = tempChunk.split(' ');
              let overlapText = '';
              let overlapTokenCount = 0;
              
              for (let i = tempWords.length - 1; i >= 0; i--) {
                const wordTokenCount = encode(tempWords[i]).length;
                if (overlapTokenCount + wordTokenCount > overlapTokens) break;
                overlapText = tempWords[i] + ' ' + overlapText;
                overlapTokenCount += wordTokenCount;
              }
              
              overlapBuffer = overlapText.trim();
              tempChunk = overlapBuffer;
              tempTokens = encode(overlapBuffer).length;
            }
            tempChunk += ' ' + word;
            tempTokens += wordTokens;
          }
          
          if (tempChunk) {
            chunks.push(tempChunk.trim());
          }
        } else {
          currentChunk = overlapBuffer + ' ' + sentence;
          currentTokens = encode(currentChunk).length;
        }
      } else {
        currentChunk += ' ' + sentence;
        currentTokens += sentenceTokens;
      }
    }

    // Add the last chunk if there's anything left
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
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
      
      // Create chunks from the transcript
      const transcriptChunks = createChunks(data);
      setChunks(transcriptChunks);
      
      // Create and download JSON file
      const jsonData = {
        videoId,
        chunks: transcriptChunks,
        totalChunks: transcriptChunks.length,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${videoId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Transcript processed and downloaded successfully!');
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error('Failed to process transcript');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-4">YouTube Transcript</h1>
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
            {isSubmitting ? 'Processing...' : 'Get Transcript'}
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

        {chunks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Chunks ({chunks.length})</h2>
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Chunk {index + 1} (Tokens: {encode(chunk).length})</div>
                  <pre className="whitespace-pre-wrap text-sm">{chunk}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 