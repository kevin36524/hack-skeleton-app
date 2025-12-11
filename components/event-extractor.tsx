"use client";

import { useState } from "react";
import { Upload, Loader2, Calendar, Clock, MapPin, Tag, FileText } from "lucide-react";

interface ExtractedEvent {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  type?: string;
  description?: string;
  additionalInfo?: string;
}

export default function EventExtractor() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setExtractedText("");
      setError(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/extract-events", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedText(data.extractedText);
      } else {
        setError(data.error || "Failed to extract events");
      }
    } catch (err) {
      setError("An error occurred while extracting events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseEvents = (text: string): ExtractedEvent[] => {
    const events: ExtractedEvent[] = [];
    const eventBlocks = text.split(/Event \d+:|##\s*Event \d+/i);

    eventBlocks.forEach((block) => {
      if (!block.trim()) return;

      const event: ExtractedEvent = {};

      const titleMatch = block.match(/(?:Title|Name):\s*(.+?)(?:\n|$)/i);
      if (titleMatch) event.title = titleMatch[1].trim();

      const dateMatch = block.match(/Date:\s*(.+?)(?:\n|$)/i);
      if (dateMatch) event.date = dateMatch[1].trim();

      const timeMatch = block.match(/Time:\s*(.+?)(?:\n|$)/i);
      if (timeMatch) event.time = timeMatch[1].trim();

      const locationMatch = block.match(/Location:\s*(.+?)(?:\n|$)/i);
      if (locationMatch) event.location = locationMatch[1].trim();

      const typeMatch = block.match(/Type:\s*(.+?)(?:\n|$)/i);
      if (typeMatch) event.type = typeMatch[1].trim();

      const descMatch = block.match(/Description:\s*(.+?)(?:\n|$)/i);
      if (descMatch) event.description = descMatch[1].trim();

      const additionalMatch = block.match(/(?:Additional Info|Additional):\s*(.+?)(?:\n|$)/i);
      if (additionalMatch) event.additionalInfo = additionalMatch[1].trim();

      if (event.title || event.date || event.description) {
        events.push(event);
      }
    });

    return events;
  };

  const events = extractedText ? parseEvents(extractedText) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Event Extractor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload an image containing event information and let AI extract the details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Upload Image
            </h2>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedImage ? selectedImage.name : "Click to upload an image"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG, JPEG up to 10MB
                  </span>
                </label>
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              <button
                onClick={handleExtract}
                disabled={!selectedImage || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Extracting Events...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Extract Events
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Extracted Events
            </h2>

            {extractedText && events.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 border border-blue-100 dark:border-gray-500 hover:shadow-md transition-shadow"
                  >
                    {event.title && (
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {event.title}
                      </h3>
                    )}

                    <div className="space-y-2">
                      {event.date && (
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200">{event.date}</span>
                        </div>
                      )}

                      {event.time && (
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200">{event.time}</span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200">{event.location}</span>
                        </div>
                      )}

                      {event.type && (
                        <div className="flex items-start">
                          <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200 font-medium">
                            {event.type}
                          </span>
                        </div>
                      )}

                      {event.description && (
                        <div className="flex items-start mt-3">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {event.description}
                          </span>
                        </div>
                      )}

                      {event.additionalInfo && (
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                          {event.additionalInfo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : extractedText ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {extractedText}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No events extracted yet. Upload an image to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What kind of images can I upload?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <p className="font-semibold mb-1">Calendar Screenshots</p>
                <p className="text-xs">Google Calendar, Outlook, Apple Calendar</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🎫</span>
              <div>
                <p className="font-semibold mb-1">Event Tickets</p>
                <p className="text-xs">Concert tickets, sports events, theater shows</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📰</span>
              <div>
                <p className="font-semibold mb-1">Posters & Flyers</p>
                <p className="text-xs">Event posters, promotional materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
