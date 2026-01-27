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
import { spacesService } from '@/lib/services/spaces-service';
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
  const [phrasesLoading, setPhrasesLoading] = useState(false);
  const [phrasesStatus, setPhrasesStatus] = useState('');
  const [phrasesError, setPhrasesError] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [similarEmailsLoading, setSimilarEmailsLoading] = useState(false);
  const [similarEmailsStatus, setSimilarEmailsStatus] = useState('');
  const [similarEmailsError, setSimilarEmailsError] = useState<string | null>(null);
  const [showMessageIds, setShowMessageIds] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

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

      // Reset save status when dialog opens
      setSaveLoading(false);
      setSaveStatus('');
      setSaveError(null);
    }
  }, [space]);

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
        setPhrasesStatus(`✓ Generated ${result.phrases.length} phrases`);

        // Update the space's extraData with phrases (no message IDs yet)
        const updatedSpace = {
          ...editedSpace,
          extraData: {
            ...editedSpace.extraData,
            allowlistedPhrases: result.phrases,
          },
        };
        setEditedSpace(updatedSpace);

        setTimeout(() => {
          setPhrasesLoading(false);
          setPhrasesStatus('');
        }, 2000);
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

  const handleGenerateFeedbackPhrases = async (phraseType: 'allowlist' | 'blocklist') => {
    if (!editedSpace || !feedbackInput.trim()) return;

    setFeedbackLoading(true);
    setPhrasesError(null);

    try {
      const result = await embeddingService.generateFeedbackPhrases({
        guid,
        accountId,
        space: editedSpace,
        userFeedback: feedbackInput,
        phraseType,
      });

      if (result.success) {
        // Add generated phrases to the appropriate list
        const currentPhrases = phraseType === 'allowlist'
          ? (editedSpace.extraData?.allowlistedPhrases || [])
          : (editedSpace.extraData?.blocklistedPhrases || []);

        const updatedPhrases = [...currentPhrases, ...result.phrases];

        const updatedSpace = {
          ...editedSpace,
          extraData: {
            ...editedSpace.extraData,
            ...(phraseType === 'allowlist'
              ? { allowlistedPhrases: updatedPhrases }
              : { blocklistedPhrases: updatedPhrases }
            ),
          },
        };
        setEditedSpace(updatedSpace);
        setFeedbackInput('');
        setFeedbackLoading(false);
      } else {
        throw new Error(result.error || 'Failed to generate phrases');
      }
    } catch (error) {
      console.error('Error generating feedback phrases:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPhrasesError(errorMessage);
      setFeedbackLoading(false);
    }
  };

  const handleFindSimilarEmails = async () => {
    if (!editedSpace) return;

    // Check if phrases exist
    const allowlistedPhrases = editedSpace.extraData?.allowlistedPhrases || [];
    if (allowlistedPhrases.length === 0) {
      setSimilarEmailsError('Please generate allowlisted phrases first');
      return;
    }

    setSimilarEmailsLoading(true);
    setSimilarEmailsError(null);
    setSimilarEmailsStatus('Finding similar emails...');

    try {
      // Get auth token from apiClient
      const token = (apiClient as any).token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/embeddings/find-similar', {
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
        throw new Error(errorData.error || 'Failed to find similar emails');
      }

      const result = await response.json();

      if (result.success) {
        setSimilarEmailsStatus(`✓ Found ${result.totalMatches} matching messages`);

        // Update the space's extraData with filtered message IDs
        const updatedSpace = {
          ...editedSpace,
          extraData: {
            ...editedSpace.extraData,
            filteredMessageIds: result.filteredMessageIds,
          },
        };
        setEditedSpace(updatedSpace);

        setTimeout(() => {
          setSimilarEmailsLoading(false);
          setSimilarEmailsStatus('');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to find similar emails');
      }
    } catch (error) {
      console.error('Error finding similar emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSimilarEmailsError(errorMessage);
      setSimilarEmailsLoading(false);
      setSimilarEmailsStatus('');
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

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveStatus('Saving changes to space...');

    try {
      let spaceToSave = editedSpace;

      if (showRawJson) {
        try {
          spaceToSave = JSON.parse(rawJsonText);
        } catch (error) {
          setSaveError('Invalid JSON format');
          setSaveLoading(false);
          setSaveStatus('');
          return;
        }
      }

      // Prepare the update object with the fields that can be updated
      const updateObj: any = {
        emailSenders: spaceToSave.emailSenders,
        keywords: spaceToSave.keywords,
        name: spaceToSave.name,
        shortName: spaceToSave.shortName,
      };

      // Include extraData if it exists
      if (spaceToSave.extraData) {
        updateObj.extraData = {
          ...spaceToSave.extraData,
          // Ensure these fields are included
          allowlistedPhrases: spaceToSave.extraData.allowlistedPhrases || [],
          blocklistedPhrases: spaceToSave.extraData.blocklistedPhrases || [],
          showSemanticMessages: spaceToSave.extraData.showSemanticMessages || false,
          filteredMessageIds: spaceToSave.extraData.filteredMessageIds || [],
          includeKeywords: spaceToSave.extraData.includeKeywords !== false,
          messageCount: spaceToSave.extraData.messageCount || 50,
        };
      }

      // Call the edit space API
      const response = await spacesService.editSpace(
        accountId,
        spaceToSave.id,
        updateObj
      );

      if (response.success) {
        setSaveStatus('✓ Changes saved successfully!');

        // Update local state
        onSave(spaceToSave);

        // Close dialog after a short delay
        setTimeout(() => {
          setSaveLoading(false);
          setSaveStatus('');
          onOpenChange(false);
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving space:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveError(errorMessage);
      setSaveLoading(false);
      setSaveStatus('');
    }
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

              {/* Allowlisted Phrases Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <Label className="text-base font-semibold">Allowlisted Phrases</Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-generate semantic phrases to identify relevant emails for this space.
                </p>

                <Button
                  onClick={handleGeneratePhrases}
                  disabled={phrasesLoading}
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
                      Generate Allowlisted Phrases
                    </>
                  )}
                </Button>

                {phrasesError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    Error: {phrasesError}
                  </div>
                )}

                {phrasesStatus && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    {phrasesStatus}
                  </div>
                )}

                {/* Editable Allowlisted Phrases */}
                {editedSpace.extraData?.allowlistedPhrases && editedSpace.extraData.allowlistedPhrases.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Phrases ({editedSpace.extraData.allowlistedPhrases.length})</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedSpace = {
                            ...editedSpace,
                            extraData: {
                              ...editedSpace.extraData,
                              allowlistedPhrases: [...(editedSpace.extraData?.allowlistedPhrases || []), '']
                            }
                          };
                          setEditedSpace(updatedSpace);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                      {editedSpace.extraData.allowlistedPhrases.map((phrase, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <Input
                            placeholder="Phrase"
                            value={phrase}
                            onChange={(e) => {
                              const newPhrases = [...(editedSpace.extraData?.allowlistedPhrases || [])];
                              newPhrases[idx] = e.target.value;
                              setEditedSpace({
                                ...editedSpace,
                                extraData: {
                                  ...editedSpace.extraData,
                                  allowlistedPhrases: newPhrases
                                }
                              });
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPhrases = [...(editedSpace.extraData?.allowlistedPhrases || [])];
                              newPhrases.splice(idx, 1);
                              setEditedSpace({
                                ...editedSpace,
                                extraData: {
                                  ...editedSpace.extraData,
                                  allowlistedPhrases: newPhrases
                                }
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Blocklisted Phrases Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <Label className="text-base font-semibold">Blocklisted Phrases</Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate phrases to exclude certain types of emails from this space.
                </p>

                {/* Editable Blocklisted Phrases */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Phrases ({editedSpace.extraData?.blocklistedPhrases?.length || 0})</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedSpace = {
                          ...editedSpace,
                          extraData: {
                            ...editedSpace.extraData,
                            blocklistedPhrases: [...(editedSpace.extraData?.blocklistedPhrases || []), '']
                          }
                        };
                        setEditedSpace(updatedSpace);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {editedSpace.extraData?.blocklistedPhrases && editedSpace.extraData.blocklistedPhrases.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                      {editedSpace.extraData.blocklistedPhrases.map((phrase, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <Input
                            placeholder="Phrase"
                            value={phrase}
                            onChange={(e) => {
                              const newPhrases = [...(editedSpace.extraData?.blocklistedPhrases || [])];
                              newPhrases[idx] = e.target.value;
                              setEditedSpace({
                                ...editedSpace,
                                extraData: {
                                  ...editedSpace.extraData,
                                  blocklistedPhrases: newPhrases
                                }
                              });
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPhrases = [...(editedSpace.extraData?.blocklistedPhrases || [])];
                              newPhrases.splice(idx, 1);
                              setEditedSpace({
                                ...editedSpace,
                                extraData: {
                                  ...editedSpace.extraData,
                                  blocklistedPhrases: newPhrases
                                }
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* User Feedback Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Label className="text-base font-semibold">Add Phrases from Feedback</Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Describe what to include or exclude, and AI will generate relevant phrases.
                </p>

                <Textarea
                  placeholder='e.g., "remove deals" or "add flight cancellation"'
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  rows={2}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateFeedbackPhrases('allowlist')}
                    disabled={feedbackLoading || !feedbackInput.trim()}
                    variant="default"
                    className="flex-1"
                  >
                    {feedbackLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add to Allowlist
                  </Button>
                  <Button
                    onClick={() => handleGenerateFeedbackPhrases('blocklist')}
                    disabled={feedbackLoading || !feedbackInput.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {feedbackLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Add to Blocklist
                  </Button>
                </div>
              </div>

              {/* Find Similar Emails Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Label className="text-base font-semibold">Find Similar Emails</Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate embeddings in memory and find emails matching your phrases. Embeddings are not saved.
                </p>

                <Button
                  onClick={handleFindSimilarEmails}
                  disabled={similarEmailsLoading || !editedSpace.extraData?.allowlistedPhrases?.length}
                  variant="default"
                  className="w-full"
                >
                  {similarEmailsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {similarEmailsStatus || 'Finding...'}
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Find Similar Emails
                    </>
                  )}
                </Button>

                {similarEmailsError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    Error: {similarEmailsError}
                  </div>
                )}

                {similarEmailsStatus && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    {similarEmailsStatus}
                  </div>
                )}

                {editedSpace.extraData?.filteredMessageIds && editedSpace.extraData.filteredMessageIds.length > 0 && (
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
                          Display only the {editedSpace.extraData.filteredMessageIds.length} messages matching your phrases
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
            </>
          )}

          <div className="space-y-3 pt-4">
            {/* Save Status Messages */}
            {saveError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                Error: {saveError}
              </div>
            )}

            {saveStatus && !saveError && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {saveStatus}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saveLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes to Space
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
