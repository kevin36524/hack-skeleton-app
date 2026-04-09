"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ImageIcon, Lightbulb, Target, Palette } from "lucide-react";

interface ReferenceImage {
  id: string;
  file?: File;
  url?: string;
  description: string;
  preview?: string;
}

interface AdIdea {
  headline: string;
  concept: string;
  visualDescription: string;
  tone: string;
  ctaSuggestion: string;
}

interface GeneratedAdResponse {
  success: boolean;
  ideas?: AdIdea[];
  raw?: string;
}

interface GeneratedAdImage {
  success: boolean;
  ad?: string;
  image?: string;
  mimeType?: string;
}

export default function AdCreatorPage() {
  const [message, setMessage] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<AdIdea[] | null>(null);
  const [generatedAdImage, setGeneratedAdImage] = useState<GeneratedAdImage | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<AdIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ReferenceImage = {
            id: Math.random().toString(36).substring(7),
            file,
            description: "",
            preview: reader.result as string,
          };
          setReferenceImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const addImageUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    const newImage: ReferenceImage = {
      id: Math.random().toString(36).substring(7),
      url: imageUrl,
      description: imageDescription,
    };
    setReferenceImages((prev) => [...prev, newImage]);
    setImageUrl("");
    setImageDescription("");
  }, [imageUrl, imageDescription]);

  const removeImage = useCallback((id: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const updateImageDescription = useCallback((id: string, description: string) => {
    setReferenceImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, description } : img))
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedIdeas(null);
    setGeneratedAdImage(null);
    setSelectedIdea(null);

    try {
      const payload: {
        message: string;
        referenceText?: string;
        referenceImages?: { url?: string; base64?: string; description?: string }[];
      } = {
        message,
      };

      if (referenceText.trim()) {
        payload.referenceText = referenceText;
      }

      if (referenceImages.length > 0) {
        payload.referenceImages = referenceImages.map((img) => ({
          url: img.url,
          base64: img.preview,
          description: img.description,
        }));
      }

      const response = await fetch("/api/ad-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: GeneratedAdResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to generate ad");
      }

      if (data.ideas && Array.isArray(data.ideas)) {
        setGeneratedIdeas(data.ideas);
      } else {
        // Fallback: try to parse from raw if ideas not present
        setError("Received invalid response format from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAdImage = async (idea: AdIdea) => {
    setIsGeneratingImage(true);
    setSelectedIdea(idea);
    setError(null);

    try {
      const payload = {
        product: message,
        adIdea: idea,
        referenceText,
      };

      const response = await fetch("/api/ad-image-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate ad image");
      }

      setGeneratedAdImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            ✨ AI Ad Creator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create compelling, high-converting ads with AI. Describe your product,
            get creative ideas, and generate stunning ad visuals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Create Your Ad</CardTitle>
              <CardDescription>
                Tell us about your product and provide any reference materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">
                    What would you like to advertise?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your product/service, target audience, and key selling points..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Reference Materials */}
                <div className="space-y-4">
                  <Label>Reference Materials (Optional)</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Text</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-2">
                      <Textarea
                        placeholder="Paste reference text, brand guidelines, or examples of the tone/style you want..."
                        value={referenceText}
                        onChange={(e) => setReferenceText(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </TabsContent>

                    <TabsContent value="images" className="space-y-4">
                      {/* Upload Files */}
                      <div className="space-y-2">
                        <Label htmlFor="image-upload" className="text-sm">
                          Upload Images
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* Add by URL */}
                      <div className="space-y-2">
                        <Label className="text-sm">Or Add by URL</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addImageUrl}
                            disabled={!imageUrl.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        <Input
                          placeholder="Image description (optional)"
                          value={imageDescription}
                          onChange={(e) => setImageDescription(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Image List */}
                      {referenceImages.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <Label className="text-sm">
                            Added Images ({referenceImages.length})
                          </Label>
                          <div className="space-y-3">
                            {referenceImages.map((img) => (
                              <div
                                key={img.id}
                                className="flex gap-3 p-3 border rounded-lg bg-muted/50"
                              >
                                {img.preview ? (
                                  <img
                                    src={img.preview}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                    URL
                                  </div>
                                )}
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Describe this image..."
                                    value={img.description}
                                    onChange={(e) =>
                                      updateImageDescription(img.id, e.target.value)
                                    }
                                    className="h-8 text-sm"
                                  />
                                  {img.url && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {img.url}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeImage(img.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || !message.trim()}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating ideas...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-5 w-5" />
                      Generate Ad Ideas
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Output Section */}
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Ad Image */}
            {generatedAdImage && (
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Your Generated Ad</CardTitle>
                  </div>
                  <CardDescription>
                    Complete ad with visual and copy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedAdImage.image ? (
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={generatedAdImage.image} 
                        alt="Generated Ad" 
                        className="w-full h-auto"
                      />
                    </div>
                  ) : generatedAdImage.ad ? (
                    <div className="whitespace-pre-wrap bg-muted/50 rounded-lg p-6 border">
                      {generatedAdImage.ad}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      No image or text was generated. Please try again.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generated Ideas */}
            {generatedIdeas && generatedIdeas.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Ad Ideas</h3>
                  <Badge variant="secondary">{generatedIdeas.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tap on an idea to generate the complete ad with an image
                </p>
                
                {generatedIdeas.map((idea, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedIdea?.headline === idea.headline
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleGenerateAdImage(idea)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {idea.headline}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {idea.tone}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {idea.concept}
                      </p>
                      
                      <div className="flex items-start gap-2 text-sm">
                        <Palette className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-muted-foreground line-clamp-2">
                          {idea.visualDescription}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {idea.ctaSuggestion}
                        </span>
                      </div>

                      <Button
                        className="w-full mt-2"
                        variant={selectedIdea?.headline === idea.headline ? "default" : "secondary"}
                        disabled={isGeneratingImage && selectedIdea?.headline === idea.headline}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAdImage(idea);
                        }}
                      >
                        {isGeneratingImage && selectedIdea?.headline === idea.headline ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Generate Ad with Image
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!generatedIdeas && !generatedAdImage && !error && (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No ideas yet</h3>
                  <p className="text-muted-foreground">
                    Fill out the form and click &quot;Generate Ad Ideas&quot; to get creative concepts
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  💡 Tips for Better Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Be specific about your target audience</li>
                  <li>• Mention key benefits, not just features</li>
                  <li>• Specify the platform (Instagram, LinkedIn, etc.)</li>
                  <li>• Include your brand voice preferences</li>
                  <li>• Add reference materials for style guidance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
