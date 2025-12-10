import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch full message body from Yahoo Mail API
const fetchMessageStep = createStep({
  id: 'fetch-message',
  description: 'Fetch full message body from Yahoo Mail API',
  inputSchema: z.object({
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  outputSchema: z.object({
    messageBody: z.object({
      text: z.string().optional(),
      html: z.string().optional(),
    }),
    fetchedAt: z.string(),
  }),
  execute: async ({ runtimeContext, inputData }) => {
    const { mailboxId, messageId } = inputData;

    // Get OAuth token from runtime context
    const token = runtimeContext.get('oauthToken');
    console.log('token', token);

    if (!token) {
      throw new Error('[WORKFLOW] OAuth token not found in runtime context. Please ensure you pass the token via runtimeContext.set("oauthToken", token)');
    }

    console.log(`[WORKFLOW] Fetching message ${messageId} from mailbox ${mailboxId}`);

    try {
      // Make API call to get full message body
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`;

      console.log(`[WORKFLOW] Calling API: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        throw new Error(`Failed to fetch message: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();

      if (!data.result || !data.result.simpleBody) {
        throw new Error('Invalid response format: missing simpleBody in result');
      }

      console.log(`[WORKFLOW] Successfully fetched message body`);

      return {
        messageBody: data.result.simpleBody,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[WORKFLOW] Error in fetchMessageStep:', error);
      throw new Error(`Failed to fetch message: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Step 2: Convert HTML to plain text
const convertHtmlToTextStep = createStep({
  id: 'convert-html-to-text',
  description: 'Convert HTML email body to plain text',
  inputSchema: z.object({
    messageBody: z.object({
      text: z.string().optional(),
      html: z.string().optional(),
    }),
    fetchedAt: z.string(),
  }),
  outputSchema: z.object({
    plainText: z.string(),
    conversionMethod: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { messageBody } = inputData;

    console.log('[WORKFLOW] Converting HTML to text', messageBody);

    // If text is available, use it directly
    if (messageBody.text && messageBody.text.trim()) {
      return {
        plainText: messageBody.text,
        conversionMethod: 'direct',
      };
    }

    // Otherwise, convert HTML to text
    if (messageBody.html) {
      // Simple HTML to text conversion
      // Remove script and style tags
      let text = messageBody.html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

      // Replace common HTML entities
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&amp;/g, '&');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&quot;/g, '"');

      // Replace line breaks
      text = text.replace(/<br\s*\/?>/gi, '\n');
      text = text.replace(/<\/p>/gi, '\n\n');
      text = text.replace(/<\/div>/gi, '\n');

      // Remove all remaining HTML tags
      text = text.replace(/<[^>]+>/g, '');

      // Clean up whitespace
      text = text.replace(/\n\s*\n/g, '\n\n');
      text = text.trim();

      return {
        plainText: text,
        conversionMethod: 'html-strip',
      };
    }

    // No content available
    return {
      plainText: '',
      conversionMethod: 'none',
    };
  },
});

// Step 3: Summarize email using AI agent
const summarizeEmailStep = createStep({
  id: 'summarize-email',
  description: 'Generate AI summary of email content',
  inputSchema: z.object({
    plainText: z.string(),
    conversionMethod: z.string(),
  }),
  outputSchema: z.object({
    summary: z.string(),
    status: z.string(),
    conversionMethod: z.string(),
    textLength: z.number().optional(),
    summarizedAt: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { plainText, conversionMethod } = inputData;

    console.log('[WORKFLOW] Generating AI summary', plainText, conversionMethod);

    if (!plainText || plainText.trim().length === 0) {
      console.log('[WORKFLOW] No content to summarize');
      return {
        summary: 'No content available to summarize.',
        status: 'empty',
        conversionMethod,
      };
    }

    try {
      if (!mastra) {
        throw new Error('Mastra instance not available in step context');
      }

      // Get the email summarizer agent
      console.log('[WORKFLOW] Getting emailSummarizer agent');
      const agent = mastra.getAgent('emailSummarizer');

      if (!agent) {
        throw new Error('emailSummarizer agent not found. Make sure it is registered in src/mastra/index.ts');
      }

      console.log(`[WORKFLOW] Generating summary for text of length ${plainText.length}`);

      // Generate summary with timeout handling
      const result = await agent.generate(
        `Please summarize the following email:\n\n${plainText}`,
      );

      console.log('[WORKFLOW] Summary generated successfully');

      return {
        summary: result.text,
        status: 'success',
        conversionMethod,
        textLength: plainText.length,
        summarizedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[WORKFLOW] Error in summarizeEmailStep:', error);
      throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const emailSummarizationWorkflow = createWorkflow({
  id: 'email-summarization',
  description: 'Fetch and summarize email messages using AI',
  inputSchema: z.object({
    mailboxId: z.string().describe('The Yahoo Mail mailbox ID'),
    messageId: z.string().describe('The message ID to summarize'),
  }),
  outputSchema: z.object({
    summary: z.string(),
    status: z.string(),
    conversionMethod: z.string(),
    textLength: z.number().optional(),
    summarizedAt: z.string().optional(),
  }),
})
.then(fetchMessageStep)
.then(convertHtmlToTextStep)
.then(summarizeEmailStep)
.commit();


//==========================================================================================================*/

const validateContentStep = createStep({
  id: "validate-content",
  description: "Validates incoming text content",
  inputSchema: z.object({
    content: z.string().min(1, "Content cannot be empty"),
    type: z.enum(["article", "blog", "social"]).default("article"),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    isValid: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    const { content, type } = inputData;

    const wordCount = content.trim().split(/\s+/).length;
    const isValid = wordCount >= 5; // Minimum 5 words

    if (!isValid) {
      throw new Error(`Content too short: ${wordCount} words`);
    }

    return {
      content: content.trim(),
      type,
      wordCount,
      isValid,
    };
  },
});


const enhanceContentStep = createStep({
  id: "enhance-content",
  description: "Adds metadata to validated content",
  inputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      processedAt: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    const { content, type, wordCount } = inputData;

    // Calculate reading time (200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Determine difficulty based on word count
    let difficulty: "easy" | "medium" | "hard" = "easy";
    if (wordCount > 100) difficulty = "medium";
    if (wordCount > 300) difficulty = "hard";

    return {
      content,
      type,
      wordCount,
      metadata: {
        readingTime,
        difficulty,
        processedAt: new Date().toISOString(),
      },
    };
  },
});


const generateSummaryStep = createStep({
  id: "generate-summary",
  description: "Creates a summary of the content",
  inputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      processedAt: z.string(),
    }),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      processedAt: z.string(),
    }),
    summary: z.string(),
    oauthToken: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { content, type, wordCount, metadata } = inputData;

    const oauthToken = runtimeContext.get('oauthToken');
    // Create a simple summary from first sentence
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() + ".";

    // Generate summary based on content length
    let summary = firstSentence;
    if (wordCount > 50) {
      summary += ` This ${type} contains ${wordCount} words and takes approximately ${metadata.readingTime} minute(s) to read.`;
    }

    console.log(`📝 Generated summary: ${summary.length} characters`);

    return {
      content,
      type,
      wordCount,
      metadata,
      summary,
      oauthToken,
    };
  },
});

export const contentWorkflow = createWorkflow({
  id: "content-processing-workflow",
  description: "Validates, enhances, and summarizes content",
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(["article", "blog", "social"]).default("article"),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      processedAt: z.string(),
    }),
    summary: z.string(),
    oauthToken: z.string(),
  }),
})
  .then(validateContentStep)
  .then(enhanceContentStep)
  .then(generateSummaryStep)
  .commit();
