'use client';

import { useState } from 'react';
import { Upload, Calendar, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ExtractedEvent {
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setExtractedText('');

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleExtractEvents = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/extract-events', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract events');
      }

      setExtractedText(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Calendar Event Extractor
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload an image of a calendar, schedule, or event and extract the details using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Upload Image
            </h2>

            {/* File Input Area */}
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {previewUrl ? (
                  <div className="relative w-full h-full p-4">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, JPEG, or WebP
                    </p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExtractEvents}
                disabled={!selectedFile || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Extract Events
                  </>
                )}
              </button>

              {(selectedFile || extractedText) && (
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Extracted Events
            </h2>

            <div className="h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing image and extracting events...
                    </p>
                  </div>
                </div>
              ) : extractedText ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {extractedText}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Upload an image and click "Extract Events" to see the results here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Tips for best results:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-400">
            <li>Use clear, high-resolution images of calendars or schedules</li>
            <li>Ensure text is readable and not blurry</li>
            <li>Works with screenshots, photos of physical calendars, or event posters</li>
            <li>The AI will extract dates, times, locations, and event descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
