# Joke Teller Agent

A fun AI agent that tells jokes and remembers your conversation history!

## Features

- 🎭 Tells various types of jokes: puns, one-liners, knock-knock jokes, dad jokes, and more
- 🧠 Uses memory to avoid repeating jokes and personalize responses
- 💬 Remembers conversation context across multiple interactions
- 🎯 Can adapt jokes to specific topics or themes

## Usage

### In your code:

```typescript
import { mastra } from "@/src/mastra";

const agent = mastra.getAgent("jokeTeller");

// Tell a joke (with memory)
const response = await agent.generate("Tell me a programming joke", {
  memory: {
    resource: "user-123",  // Unique user identifier
    thread: "chat-session-1"  // Unique conversation session
  }
});

console.log(response.text);

// Ask for another joke - agent will remember the first one
const response2 = await agent.generate("Tell me another one!", {
  memory: {
    resource: "user-123",  // Same user
    thread: "chat-session-1"  // Same conversation
  }
});

// The agent will remember past jokes and won't repeat them!
```

### Memory Parameters:

- **resource**: Identifies the user or entity (e.g., user ID, email, etc.)
- **thread**: Identifies the conversation session (e.g., chat session ID, conversation ID)

Both must be consistent across calls for the agent to maintain memory.

### Example Prompts:

- "Tell me a joke"
- "Tell me a dad joke about computers"
- "Give me 3 knock-knock jokes"
- "What was that first joke about?" (tests memory)
- "Tell me something different this time"

## Configuration

- **Model**: `google/gemini-2.5-flash-lite` (fast and cost-effective)
- **Memory**: Stores last 20 messages per conversation
- **Storage**: Uses LibSQL database (`mastra-memory.db`)

## Tips

1. Always use the same `resource` and `thread` IDs for a conversation to maintain memory
2. Different thread IDs for the same user will create separate conversation contexts
3. The agent will remember joke preferences and avoid repetition within a conversation
