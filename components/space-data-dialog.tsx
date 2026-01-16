'use client';

import { useState, useEffect } from 'react';
import { Space, EmailSender } from '@/lib/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, Plus, Save, Loader2, Database, Sparkles, ChevronDown } from 'lucide-react';
import { embeddingService } from '@/lib/services/embedding-service';
import { apiClient } from '@/lib/services/api-client';
import { cn } from '@/lib/utils';

interface SpaceDataDialogProps {
  space: Space | null;
  accountId: string;
  mailboxId: string;
  guid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSpace: Space) => void;
}

export function SpaceDataDialog({
  space,
  accountId,
  mailboxId,
  guid,
  open,
  onOpenChange,
  onSave
}: SpaceDataDialogProps) {
  const [editedSpace, setEditedSpace] = useState<Space | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [embeddingExists, setEmbeddingExists] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState('');
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [phrasesLoading, setPhrasesLoading] = useState(false);
  const [phrasesStatus, setPhrasesStatus] = useState('');
  const [phrasesError, setPhrasesError] = useState<string | null>(null);
  const [generatedPhrases, setGeneratedPhrases] = useState<string[]>([]);
  const [showMessageIds, setShowMessageIds] = useState(false);

  useEffect(() => {
    if (space) {
      // Ensure extraData exists with defaults
      const spaceWithDefaults = {
        ...space,
        extraData: {
          ...space.extraData,
          includeKeywords: space.extraData?.includeKeywords !== false,
          messageCount: space.extraData?.messageCount || 50
        }
      };
      setEditedSpace(spaceWithDefaults);
      setRawJsonText(JSON.stringify(spaceWithDefaults, null, 2));
    }
  }, [space]);

  // Check if embeddings exist when dialog opens
  useEffect(() => {
    const checkEmbeddings = async () => {
      if (open && space && guid && accountId) {
        try {
          const result = await embeddingService.checkExists(guid, accountId, space.name);
          setEmbeddingExists(result.exists);
        } catch (error) {
          console.error('Failed to check embeddings:', error);
        }
      }
    };

    checkEmbeddings();
  }, [open, space, guid, accountId]);

  const handleGenerateEmbeddings = async () => {
    if (!editedSpace) return;

    setEmbeddingLoading(true);
    setEmbeddingError(null);
    setEmbeddingStatus('Preparing...');

    try {
      // Get auth token from apiClient
      const token = (apiClient as any).token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      setEmbeddingStatus('Fetching messages...');

      const response = await fetch('/api/embeddings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mailboxId,
          accountId,
          guid,
          space: editedSpace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate embeddings');
      }

      const result = await response.json();

      if (result.success) {
        setEmbeddingStatus(`✓ Complete! Generated ${result.embeddingCount} embeddings`);
        setEmbeddingExists(true);
        setTimeout(() => {
          setEmbeddingLoading(false);
          setEmbeddingStatus('');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to generate embeddings');
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setEmbeddingError(errorMessage);
      setEmbeddingLoading(false);
      setEmbeddingStatus('');
    }
  };

  const handleGeneratePhrases = async () => {
    if (!editedSpace) return;

    setPhrasesLoading(true);
    setPhrasesError(null);
    setPhrasesStatus('Generating phrases...');

    try {
      const result = await embeddingService.generateAllowlistedPhrases({
        guid,
        accountId,
        space: editedSpace,
      });

      if (result.success) {
        setGeneratedPhrases(result.phrases);
        setPhrasesStatus(`✓ Generated ${result.phrases.length} phrases, found ${result.totalMatches} matching messages`);

        // Update the space's extraData with filtered message IDs and phrases
        const updatedSpace = {
          ...editedSpace,
          extraData: {
            ...editedSpace.extraData,
            allowlistedPhrases: result.phrases,
            filteredMessageIds: result.filteredMessageIds,
          },
        };
        setEditedSpace(updatedSpace);

        setTimeout(() => {
          setPhrasesLoading(false);
          setPhrasesStatus('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to generate phrases');
      }
    } catch (error) {
      console.error('Error generating phrases:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPhrasesError(errorMessage);
      setPhrasesLoading(false);
      setPhrasesStatus('');
    }
  };

  if (!editedSpace) return null;

  const handleAddSender = () => {
    const newSender: EmailSender = { name: '', email: '' };
    setEditedSpace({
      ...editedSpace,
      emailSenders: [...editedSpace.emailSenders, newSender]
    });
  };

  const handleRemoveSender = (index: number) => {
    const newSenders = [...editedSpace.emailSenders];
    newSenders.splice(index, 1);
    setEditedSpace({
      ...editedSpace,
      emailSenders: newSenders
    });
  };

  const handleUpdateSender = (index: number, field: 'name' | 'email', value: string) => {
    const newSenders = [...editedSpace.emailSenders];
    newSenders[index][field] = value;
    setEditedSpace({
      ...editedSpace,
      emailSenders: newSenders
    });
  };

  const handleAddKeyword = () => {
    setEditedSpace({
      ...editedSpace,
      keywords: [...editedSpace.keywords, '']
    });
  };

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = [...editedSpace.keywords];
    newKeywords.splice(index, 1);
    setEditedSpace({
      ...editedSpace,
      keywords: newKeywords
    });
  };

  const handleUpdateKeyword = (index: number, value: string) => {
    const newKeywords = [...editedSpace.keywords];
    newKeywords[index] = value;
    setEditedSpace({
      ...editedSpace,
      keywords: newKeywords
    });
  };

  const handleSave = () => {
    if (showRawJson) {
      try {
        const parsed = JSON.parse(rawJsonText);
        onSave(parsed);
      } catch (error) {
        alert('Invalid JSON format');
        return;
      }
    } else {
      onSave(editedSpace);
    }
    onOpenChange(false);
  };

  const handleRawJsonChange = (value: string) => {
    setRawJsonText(value);
  };

  const toggleView = () => {
    if (!showRawJson) {
      // Switching to raw JSON view - update the text with current edited state
      setRawJsonText(JSON.stringify(editedSpace, null, 2));
    } else {
      // Switching to form view - try to parse and update editedSpace
      try {
        const parsed = JSON.parse(rawJsonText);
        setEditedSpace(parsed);
      } catch (error) {
        alert('Invalid JSON - keeping form view with previous data');
        return;
      }
    }
    setShowRawJson(!showRawJson);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Space Data: {editedSpace.name}</DialogTitle>
          <DialogDescription>
            View and modify space configuration including email senders and keywords
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleView}
            >
              {showRawJson ? 'Show Form' : 'Show Raw JSON'}
            </Button>
          </div>

          {showRawJson ? (
            <div className="space-y-2">
              <Label>Raw JSON Data</Label>
              <Textarea
                value={rawJsonText}
                onChange={(e) => handleRawJsonChange(e.target.value)}
                className="font-mono text-xs min-h-[400px]"
                placeholder="Enter valid JSON"
              />
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Space Name</Label>
                <Input
                  value={editedSpace.name}
                  onChange={(e) => setEditedSpace({ ...editedSpace, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Short Name</Label>
                <Input
                  value={editedSpace.shortName}
                  onChange={(e) => setEditedSpace({ ...editedSpace, shortName: e.target.value })}
                />
              </div>

              {/* Message Count */}
              <div className="space-y-2">
                <Label>Message Count</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={editedSpace.extraData?.messageCount || 50}
                  onChange={(e) => setEditedSpace({
                    ...editedSpace,
                    extraData: {
                      ...editedSpace.extraData,
                      messageCount: parseInt(e.target.value) || 50
                    }
                  })}
                />
                <p className="text-xs text-gray-500">Number of messages to fetch (default: 50)</p>
              </div>

              {/* Email Senders */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Senders</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSender}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sender
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {editedSpace.emailSenders.map((sender, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Name"
                        value={sender.name}
                        onChange={(e) => handleUpdateSender(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Email"
                        value={sender.email}
                        onChange={(e) => handleUpdateSender(index, 'email', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSender(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {editedSpace.emailSenders.length === 0 && (
                    <p className="text-sm text-gray-500">No email senders configured</p>
                  )}
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label>Keywords</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="include-keywords"
                        checked={editedSpace.extraData?.includeKeywords !== false}
                        onCheckedChange={(checked) => {
                          setEditedSpace({
                            ...editedSpace,
                            extraData: {
                              ...editedSpace.extraData,
                              includeKeywords: checked === true
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="include-keywords"
                        className="text-sm font-normal text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        Include in query
                      </label>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddKeyword}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Keyword
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {editedSpace.keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Keyword"
                        value={keyword}
                        onChange={(e) => handleUpdateKeyword(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveKeyword(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {editedSpace.keywords.length === 0 && (
                    <p className="text-sm text-gray-500">No keywords configured</p>
                  )}
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-2">
                <Label>Justification</Label>
                <Textarea
                  value={editedSpace.justification}
                  onChange={(e) => setEditedSpace({ ...editedSpace, justification: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Relevance Score */}
              <div className="space-y-2">
                <Label>Relevance Score</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={editedSpace.relevanceScore}
                  onChange={(e) => setEditedSpace({ ...editedSpace, relevanceScore: parseFloat(e.target.value) })}
                />
              </div>

              {/* Vector Embeddings Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Label className="text-base font-semibold">Vector Embeddings</Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate OpenAI text embeddings for similarity search and semantic analysis.
                  Embeddings are created from email subjects and snippets.
                </p>

                <Button
                  onClick={handleGenerateEmbeddings}
                  disabled={embeddingLoading}
                  variant={embeddingExists ? 'outline' : 'default'}
                  className="w-full"
                >
                  {embeddingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {embeddingStatus || 'Generating...'}
                    </>
                  ) : embeddingExists ? (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Recompute Embeddings
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Generate Embeddings
                    </>
                  )}
                </Button>

                {embeddingError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    Error: {embeddingError}
                  </div>
                )}

                {embeddingExists && !embeddingLoading && !embeddingError && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Embeddings file exists for this space
                  </div>
                )}
              </div>

              {/* Allowlisted Phrases Section */}
              {embeddingExists && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Label className="text-base font-semibold">Allowlisted Phrases</Label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI-generate semantic phrases to filter relevant emails using vector similarity.
                    Matches will be saved to this space's filtered messages.
                  </p>

                  <Button
                    onClick={handleGeneratePhrases}
                    disabled={phrasesLoading || !embeddingExists}
                    variant="default"
                    className="w-full"
                  >
                    {phrasesLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {phrasesStatus || 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Allowlisted Phrases
                      </>
                    )}
                  </Button>

                  {phrasesError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      Error: {phrasesError}
                    </div>
                  )}

                  {generatedPhrases.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                        {phrasesStatus || `Generated ${generatedPhrases.length} phrases`}
                      </div>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                        <ul className="space-y-1 text-sm">
                          {generatedPhrases.map((phrase, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-600 dark:text-purple-400">•</span>
                              <span>{phrase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {editedSpace.extraData?.filteredMessageIds && (
                        <div className="space-y-3">
                          {/* Show Semantic Messages Toggle */}
                          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <Checkbox
                              id="show-semantic"
                              checked={editedSpace.extraData?.showSemanticMessages === true}
                              onCheckedChange={(checked) => {
                                setEditedSpace({
                                  ...editedSpace,
                                  extraData: {
                                    ...editedSpace.extraData,
                                    showSemanticMessages: checked === true
                                  }
                                });
                              }}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor="show-semantic"
                                className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer block"
                              >
                                Show semantic messages only
                              </label>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Display only the {editedSpace.extraData.filteredMessageIds.length} messages matching allowlisted phrases
                              </p>
                            </div>
                          </div>

                          {/* Collapsible Message IDs */}
                          <Collapsible
                            open={showMessageIds}
                            onOpenChange={setShowMessageIds}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-xs"
                              >
                                <span className="text-gray-600 dark:text-gray-400">
                                  {editedSpace.extraData.filteredMessageIds.length} messages matched
                                </span>
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 transition-transform',
                                    showMessageIds && 'rotate-180'
                                  )}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-white dark:bg-gray-900">
                                <div className="space-y-1">
                                  {editedSpace.extraData.filteredMessageIds.map((mid, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs font-mono text-gray-700 dark:text-gray-300 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                    >
                                      {idx + 1}. {mid}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
