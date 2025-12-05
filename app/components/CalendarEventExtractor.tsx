"use client";

import { useState } from "react";
import Image from "next/image";

interface CalendarEvent {
  title?: string | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  description?: string | null;
  attendees?: string[] | null;
  isRecurring?: boolean | null;
  recurrencePattern?: string | null;
  additionalNotes?: string | null;
  rawResponse?: string;
}

export default function CalendarEventExtractor() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalendarEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/extract-calendar-event", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract calendar event");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
          Calendar Event Extractor
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Upload an image containing calendar event information and let AI extract the details
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <label
            htmlFor="image-upload"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Upload Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="block w-full text-sm text-zinc-500 dark:text-zinc-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-zinc-900 file:text-white
              dark:file:bg-zinc-50 dark:file:text-zinc-900
              hover:file:bg-zinc-700 dark:hover:file:bg-zinc-200
              file:cursor-pointer cursor-pointer"
          />
        </div>

        {selectedImage && (
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Preview:
            </p>
            <div className="relative w-full max-h-96 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleExtract}
            disabled={!selectedFile || loading}
            className="flex-1 py-3 px-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-semibold
              hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? "Extracting..." : "Extract Event Details"}
          </button>
          {selectedFile && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="py-3 px-6 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold
                hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
            Extracted Event Details
          </h2>

          {result.rawResponse && !result.title ? (
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {result.rawResponse}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Title" value={result.title} />
              <DetailItem label="Date" value={result.date} />
              <DetailItem label="Start Time" value={result.startTime} />
              <DetailItem label="End Time" value={result.endTime} />
              <DetailItem label="Location" value={result.location} className="md:col-span-2" />
              <DetailItem label="Description" value={result.description} className="md:col-span-2" />
              {result.attendees && result.attendees.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Attendees:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.attendees.map((attendee, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.isRecurring && (
                <>
                  <DetailItem label="Recurring" value={result.isRecurring ? "Yes" : "No"} />
                  <DetailItem label="Recurrence Pattern" value={result.recurrencePattern} />
                </>
              )}
              {result.additionalNotes && (
                <DetailItem
                  label="Additional Notes"
                  value={result.additionalNotes}
                  className="md:col-span-2"
                />
              )}
            </div>
          )}

          {/* Export Options */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(result, null, 2);
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "calendar-event.json";
                a.click();
              }}
              className="py-2 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium
                hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Download as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string | boolean | null | undefined;
  className?: string;
}

function DetailItem({ label, value, className = "" }: DetailItemProps) {
  if (!value || value === "null") return null;

  return (
    <div className={`bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 ${className}`}>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{label}:</p>
      <p className="text-zinc-900 dark:text-zinc-50">{String(value)}</p>
    </div>
  );
}
