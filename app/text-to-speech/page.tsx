'use client';

import { useState, useRef } from 'react';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // Rachel voice
  const [modelId, setModelId] = useState('eleven_monolingual_v1');
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
          modelId,
          stability,
          similarityBoost,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to convert text to speech');
      }

      // Convert base64 to blob URL
      const audioBase64 = data.data.audioBase64;
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `speech-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Text to Speech
          </h1>
          <p className="text-gray-600 mb-8">
            Convert your text to natural-sounding speech using ElevenLabs AI
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Input */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Text to Convert
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={6}
                placeholder="Enter the text you want to convert to speech..."
                required
              />
            </div>

            {/* Advanced Settings */}
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700">
                Advanced Settings
              </summary>
              <div className="mt-4 space-y-4">
                {/* Voice ID */}
                <div>
                  <label htmlFor="voiceId" className="block text-sm font-medium text-gray-700 mb-2">
                    Voice ID
                  </label>
                  <input
                    type="text"
                    id="voiceId"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="21m00Tcm4TlvDq8ikWAM"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: Rachel voice (21m00Tcm4TlvDq8ikWAM)
                  </p>
                </div>

                {/* Model ID */}
                <div>
                  <label htmlFor="modelId" className="block text-sm font-medium text-gray-700 mb-2">
                    Model ID
                  </label>
                  <select
                    id="modelId"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="eleven_monolingual_v1">Monolingual v1</option>
                    <option value="eleven_multilingual_v2">Multilingual v2</option>
                    <option value="eleven_turbo_v2">Turbo v2</option>
                  </select>
                </div>

                {/* Stability */}
                <div>
                  <label htmlFor="stability" className="block text-sm font-medium text-gray-700 mb-2">
                    Stability: {stability}
                  </label>
                  <input
                    type="range"
                    id="stability"
                    min="0"
                    max="1"
                    step="0.01"
                    value={stability}
                    onChange={(e) => setStability(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Higher stability = more consistent but less expressive
                  </p>
                </div>

                {/* Similarity Boost */}
                <div>
                  <label htmlFor="similarityBoost" className="block text-sm font-medium text-gray-700 mb-2">
                    Similarity Boost: {similarityBoost}
                  </label>
                  <input
                    type="range"
                    id="similarityBoost"
                    min="0"
                    max="1"
                    step="0.01"
                    value={similarityBoost}
                    onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Higher similarity = closer to original voice
                  </p>
                </div>
              </div>
            </details>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Converting...' : 'Convert to Speech'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Speech is Ready!
              </h2>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full mb-4"
              />
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Download Audio
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            About This Tool
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>Powered by ElevenLabs AI for natural-sounding speech</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>Uses Mastra framework for seamless integration</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>Customize voice settings for different styles</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>Download generated audio as MP3 files</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
