"use client";

import { useState, useRef } from "react";
import { Upload, Calendar, Loader2, X, Copy, Check } from "lucide-react";

interface CalendarEvent {
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

interface ExtractionResult {
  success: boolean;
  events: CalendarEvent[];
  rawResponse?: string;
}

export default function CalendarEventExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          setFileName("Pasted image");
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
          setResult(null);
          setError(null);
        }
      }
    }
  };

  const handleExtract = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("image", blob, fileName);
      if (instructions.trim()) {
        formData.append("instructions", instructions);
      }

      // Send to API
      const apiResponse = await fetch("/api/extract-events", {
        method: "POST",
        body: formData,
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || "Failed to extract events");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setFileName("");
    setInstructions("");
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(
        JSON.stringify(result.events, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    return time;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Calendar Event Extractor
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Upload or paste an image containing calendar events, and AI will
          extract them for you
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Upload & Instructions */}
        <div className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center space-y-4">
            {!image ? (
              <>
                <div
                  className="cursor-pointer"
                  onPaste={handlePaste}
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto text-zinc-400" />
                  <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    Upload or Paste Image
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Click to upload or paste (Ctrl+V) an image of your calendar
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Supports screenshots, photos, meeting invites, event flyers
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={image}
                    alt="Uploaded calendar"
                    className="max-h-64 mx-auto rounded-lg border border-zinc-200 dark:border-zinc-700"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {fileName}
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          {image && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Additional Instructions (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Focus on events in December, Extract only meeting times, etc."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-zinc-50 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Extract Button */}
          {image && (
            <button
              onClick={handleExtract}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting Events...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Extract Calendar Events
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-red-800 dark:text-red-300 font-medium">
                Error
              </h3>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
            </div>
          )}

          {result && result.events.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Extracted Events ({result.events.length})
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy JSON
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {result.events.map((event, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-2"
                  >
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                      {event.title}
                    </h3>
                    {event.date && (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Date:</span> {event.date}
                      </div>
                    )}
                    {(event.startTime || event.endTime) && (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Time:</span>{" "}
                        {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Location:</span>{" "}
                        {event.location}
                      </div>
                    )}
                    {event.description && (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Description:</span>{" "}
                        {event.description}
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Attendees:</span>{" "}
                        {event.attendees.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && result.events.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-medium">
                No Events Found
              </h3>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                No calendar events were detected in the image. Try uploading a
                clearer image or one with visible calendar information.
              </p>
            </div>
          )}

          {!result && !error && !loading && image && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium">
                Ready to Extract
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                Click the "Extract Calendar Events" button to analyze your
                image and extract calendar events.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
