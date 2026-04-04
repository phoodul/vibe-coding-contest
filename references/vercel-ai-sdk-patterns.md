# Vercel AI SDK — Quick Reference
> Context7 기반 최신 문서 조회 결과. 공모전 개발 시 빠른 참조용.

> **SDK Versions covered**: AI SDK 4.x / 5.x / 6.x (latest as of 2026-04)
> **Docs**: https://sdk.vercel.ai · https://vercel.com/docs/ai-sdk

---

## Table of Contents

1. [Installation & Provider Setup](#1-installation--provider-setup)
2. [Core: generateText](#2-core-generatetext)
3. [Core: streamText](#3-core-streamtext)
4. [Core: generateObject](#4-core-generateobject)
5. [Core: streamObject](#5-core-streamobject)
6. [React Hook: useChat](#6-react-hook-usechat)
7. [React Hook: useCompletion](#7-react-hook-usecompletion)
8. [React Hook: useObject](#8-react-hook-useobject)
9. [Next.js 15 App Router — Route Handlers](#9-nextjs-15-app-router--route-handlers)
10. [Tool / Function Calling](#10-tool--function-calling)
11. [Multi-Step Agent Patterns](#11-multi-step-agent-patterns)
12. [Error Handling in Streaming](#12-error-handling-in-streaming)
13. [Middleware](#13-middleware)
14. [Tips & Gotchas](#14-tips--gotchas)

---

## 1. Installation & Provider Setup

### Packages

```bash
# Core SDK
npm install ai

# Anthropic provider
npm install @ai-sdk/anthropic

# Other providers (optional)
npm install @ai-sdk/openai @ai-sdk/google
```

### Anthropic Provider — Default (env-based)

```typescript
// Uses ANTHROPIC_API_KEY env var automatically
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Hello!',
});
```

> AI SDK 5+ supports **string-based model IDs** like `'anthropic/claude-sonnet-4-5'` without explicit provider import, as long as `@ai-sdk/anthropic` is installed.

### Anthropic Provider — Custom Configuration

```typescript
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,  // default: ANTHROPIC_API_KEY env
  baseURL: 'https://api.anthropic.com/v1', // default
  headers: { 'Custom-Header': 'value' },   // optional
  // fetch: customFetch,                   // optional custom fetch
});

// Use the instance
const { text } = await generateText({
  model: anthropic('claude-sonnet-4-5'),
  prompt: 'Hello!',
});
```

### Available Anthropic Models (2026)

| Model ID | Notes |
|---|---|
| `claude-opus-4-6` | Latest flagship |
| `claude-sonnet-4-6` | Latest balanced |
| `claude-sonnet-4-5` | Previous balanced |
| `claude-opus-4-5` | Previous flagship |
| `claude-haiku-3-5` | Fast & cheap |

---

## 2. Core: generateText

Non-streaming text generation. Best for: email drafts, summaries, agent tool loops.

```typescript
import { generateText } from 'ai';

const { text, usage, finishReason, response } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  system: 'You are a helpful assistant.',
  prompt: 'Summarize the benefits of TypeScript.',
  maxTokens: 1024,
  temperature: 0.7,
});

console.log(text);
console.log(usage); // { promptTokens, completionTokens, totalTokens }
```

### With Messages (chat format)

```typescript
const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  messages: [
    { role: 'system', content: 'You are a coding tutor.' },
    { role: 'user', content: 'Explain async/await in TypeScript.' },
  ],
});
```

### Key Return Properties

| Property | Type | Description |
|---|---|---|
| `text` | `string` | Generated text |
| `usage` | `TokenUsage` | Token counts |
| `finishReason` | `string` | `'stop'`, `'length'`, `'tool-calls'`, etc. |
| `response` | `object` | Raw response with `id`, `model`, `body` |
| `steps` | `Step[]` | All intermediate steps (when using tools) |
| `toolCalls` | `ToolCall[]` | Tool calls from the last step |
| `toolResults` | `ToolResult[]` | Tool results from the last step |

---

## 3. Core: streamText

Streaming text generation. Best for: real-time chat UI, long-form content.

```typescript
import { streamText } from 'ai';

const result = streamText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Write a short story about a robot.',
  maxTokens: 2048,
});

// Option A: Async iterator
for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}

// Option B: Full text after stream completes
const fullText = await result.text;
```

### With Callbacks

```typescript
const result = streamText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Hello!',

  onChunk({ chunk }) {
    // Called for each chunk: text-delta, tool-call, tool-result, etc.
  },
  onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
    // Called after each step (useful for multi-step agents)
  },
  onFinish({ text, usage, finishReason }) {
    // Called when the entire stream is complete
    console.log('Total tokens:', usage.totalTokens);
  },
  onError({ error }) {
    // AI SDK 4.2+: Called when an error occurs during streaming
    console.error('Stream error:', error);
  },
});
```

### Key Return Properties

| Property | Type | Description |
|---|---|---|
| `textStream` | `AsyncIterable<string>` | Stream of text deltas |
| `fullStream` | `AsyncIterable<StreamPart>` | Full stream with all event types |
| `text` | `Promise<string>` | Resolves to complete text |
| `usage` | `Promise<TokenUsage>` | Resolves to token usage |
| `toDataStreamResponse()` | `Response` | For Next.js route handlers (useChat) |
| `toUIMessageStreamResponse()` | `Response` | For AI SDK 5+ UI message streams |
| `toTextStreamResponse()` | `Response` | Plain text stream response |

---

## 4. Core: generateObject

Structured output with schema validation. Non-streaming.

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: 'anthropic/claude-sonnet-4-5',
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({
        name: z.string(),
        amount: z.string(),
      })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(object.recipe.name);       // Type-safe!
console.log(object.recipe.ingredients); // { name: string; amount: string }[]
```

### Extraction Pattern

```typescript
const { object } = await generateObject({
  model: 'anthropic/claude-sonnet-4-5',
  schema: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    score: z.number().min(0).max(10),
  }),
  prompt: `Extract pros, cons, sentiment, and score from: "${reviewText}"`,
});
```

### Key Return Properties

| Property | Type | Description |
|---|---|---|
| `object` | `T` (inferred from schema) | The generated, validated object |
| `usage` | `TokenUsage` | Token counts |
| `finishReason` | `string` | Finish reason |

---

## 5. Core: streamObject

Streaming structured output. Partial objects arrive as they're generated.

```typescript
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: 'anthropic/claude-sonnet-4-5',
  schema: z.object({
    title: z.string(),
    sections: z.array(z.object({
      heading: z.string(),
      content: z.string(),
    })),
  }),
  prompt: 'Write an outline about AI safety.',
});

// Partial objects stream as they're generated
for await (const partialObject of result.partialObjectStream) {
  console.log(partialObject);
  // e.g. { title: 'AI Safety' }
  // then { title: 'AI Safety', sections: [{ heading: '...' }] }
}

// Or wait for the final object
const finalObject = await result.object;
```

### Array Output Mode

```typescript
const result = streamObject({
  model: 'anthropic/claude-sonnet-4-5',
  output: 'array',
  schema: z.object({
    question: z.string(),
    answer: z.string(),
  }),
  prompt: 'Generate 5 FAQ items about Next.js.',
});

// Each complete array element streams as it becomes available
for await (const partialObject of result.partialObjectStream) {
  console.log(partialObject); // Complete items appear one by one
}
```

---

## 6. React Hook: useChat

Full-featured chat hook with automatic state management and streaming.

### Client Component

```tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
  const {
    messages,       // Message[]
    input,          // string — current input value
    handleInputChange, // onChange handler
    handleSubmit,   // onSubmit handler
    isLoading,      // boolean
    error,          // Error | undefined
    reload,         // () => void — retry last message
    stop,           // () => void — abort current stream
    setMessages,    // (messages: Message[]) => void
    append,         // (message: Message) => void
  } = useChat({
    api: '/api/chat',             // default: '/api/chat'
    maxSteps: 5,                  // enable multi-step tool use
    onError(error) {
      console.error('Chat error:', error);
    },
    onFinish(message) {
      console.log('Completed:', message);
    },
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.parts?.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.text}</span>;
            if (part.type === 'tool-invocation') {
              return <pre key={i}>{JSON.stringify(part.toolInvocation, null, 2)}</pre>;
            }
            return null;
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
      {isLoading && <button onClick={stop}>Stop</button>}
      {error && <button onClick={reload}>Retry</button>}
    </div>
  );
}
```

### Key useChat Options

| Option | Type | Description |
|---|---|---|
| `api` | `string` | API endpoint (default: `'/api/chat'`) |
| `id` | `string` | Unique chat ID for multiple chats |
| `initialMessages` | `Message[]` | Pre-populate messages |
| `maxSteps` | `number` | Max tool-call roundtrips |
| `onError` | `(error) => void` | Error callback |
| `onFinish` | `(message) => void` | Stream complete callback |
| `body` | `object` | Extra data sent with each request |
| `headers` | `Record<string, string>` | Custom request headers |

---

## 7. React Hook: useCompletion

Simple text completion hook (non-chat, single prompt/response).

```tsx
'use client';

import { useCompletion } from '@ai-sdk/react';

export default function CompletionPage() {
  const {
    completion,       // string — the streamed completion
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useCompletion({
    api: '/api/completion',
  });

  return (
    <div>
      <p>{completion}</p>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Complete</button>
      </form>
    </div>
  );
}
```

### Route Handler for useCompletion

```typescript
// app/api/completion/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-5',
    prompt,
  });

  return result.toDataStreamResponse();
}
```

---

## 8. React Hook: useObject

Stream structured objects to the client with real-time partial updates.

### Client Component

```tsx
'use client';

import { useObject } from '@ai-sdk/react';
import { z } from 'zod';

const notificationSchema = z.object({
  notifications: z.array(z.object({
    title: z.string(),
    message: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
  })),
});

export default function NotificationsPage() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <div>
      <button onClick={() => submit('Generate 3 sample notifications')}>
        Generate
      </button>
      {isLoading && <p>Generating...</p>}
      {object?.notifications?.map((n, i) => (
        <div key={i}>
          <h3>{n?.title}</h3>
          <p>{n?.message}</p>
          <span>{n?.priority}</span>
        </div>
      ))}
    </div>
  );
}
```

### Route Handler for useObject

```typescript
// app/api/notifications/route.ts
import { streamObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: 'anthropic/claude-sonnet-4-5',
    schema: z.object({
      notifications: z.array(z.object({
        title: z.string(),
        message: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
      })),
    }),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

> **Note**: `useObject` accesses partial fields (e.g., `object?.notifications?.[0]?.title`) because data streams incrementally. Always use optional chaining.

---

## 9. Next.js 15 App Router — Route Handlers

### Basic Chat Route (useChat compatible)

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30; // Vercel serverless timeout (seconds)

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-5',
    system: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

### With Tools

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-5',
    system: 'You are a helpful assistant with tool access.',
    messages: await convertToModelMessages(messages),
    tools: {
      getWeather: tool({
        description: 'Get current weather for a location',
        inputSchema: z.object({
          location: z.string().describe('City name'),
        }),
        execute: async ({ location }) => {
          // Call your weather API here
          return { location, temperature: 22, condition: 'sunny' };
        },
      }),
    },
    maxSteps: 5, // Allow multi-step tool use
  });

  return result.toUIMessageStreamResponse();
}
```

### Non-streaming Route (generateText)

```typescript
// app/api/summarize/route.ts
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { text } = await req.json();

  const { text: summary } = await generateText({
    model: 'anthropic/claude-sonnet-4-5',
    prompt: `Summarize: ${text}`,
  });

  return Response.json({ summary });
}
```

### Structured Output Route (generateObject)

```typescript
// app/api/extract/route.ts
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { content } = await req.json();

  const { object } = await generateObject({
    model: 'anthropic/claude-sonnet-4-5',
    schema: z.object({
      entities: z.array(z.object({
        name: z.string(),
        type: z.enum(['person', 'organization', 'location']),
      })),
      summary: z.string(),
    }),
    prompt: `Extract entities and summarize: ${content}`,
  });

  return Response.json(object);
}
```

---

## 10. Tool / Function Calling

### Defining Tools

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get the current weather for a location. Use when the user asks about weather.',
  inputSchema: z.object({
    location: z.string().describe('City and state, e.g. San Francisco, CA'),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius')
      .describe('Temperature unit'),
  }),
  execute: async ({ location, unit }) => {
    // Your API call here
    const data = await fetchWeather(location, unit);
    return {
      location,
      temperature: data.temp,
      condition: data.condition,
      unit,
    };
  },
});
```

### Using Tools with generateText

```typescript
import { generateText, tool } from 'ai';
import { z } from 'zod';

const { text, toolCalls, toolResults, steps } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'What is the weather in Tokyo and Seoul?',
  tools: {
    getWeather: tool({
      description: 'Get weather for a location',
      inputSchema: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: Math.round(Math.random() * 30),
        condition: 'partly cloudy',
      }),
    }),
  },
  maxSteps: 5, // Allow the model to call tools and then respond
});

// `text` contains the final response incorporating tool results
// `steps` contains all intermediate steps
// `toolCalls` / `toolResults` are from the last step
```

### Using Tools with streamText

```typescript
const result = streamText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Look up the weather in Paris.',
  tools: {
    getWeather: weatherTool,
  },
  maxSteps: 5,
  onStepFinish({ text, toolCalls, toolResults, finishReason }) {
    console.log('Step finished:', { finishReason, toolCalls });
  },
});
```

### Client-Side Tool Rendering (useChat)

```tsx
// In the useChat component, tool invocations appear in message parts:
{messages.map((m) => (
  <div key={m.id}>
    {m.parts?.map((part, i) => {
      switch (part.type) {
        case 'text':
          return <p key={i}>{part.text}</p>;
        case 'tool-invocation':
          return (
            <div key={i}>
              <strong>Tool: {part.toolInvocation.toolName}</strong>
              <pre>{JSON.stringify(part.toolInvocation.args, null, 2)}</pre>
              {part.toolInvocation.state === 'result' && (
                <pre>{JSON.stringify(part.toolInvocation.result, null, 2)}</pre>
              )}
            </div>
          );
        default:
          return null;
      }
    })}
  </div>
))}
```

### AI SDK 6: Human-in-the-Loop Approval

```typescript
const searchTool = tool({
  description: 'Search the web',
  inputSchema: z.object({ query: z.string() }),
  needsApproval: true, // SDK 6+ — requires user confirmation
  execute: async ({ query }) => {
    return await searchWeb(query);
  },
});
```

---

## 11. Multi-Step Agent Patterns

### Basic Agent Loop (generateText)

```typescript
import { generateText, tool } from 'ai';
import { z } from 'zod';

const { text, steps } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  system: `You are a research assistant. Use tools to find information, 
           then synthesize a comprehensive answer.`,
  prompt: userQuery,
  tools: {
    search: tool({
      description: 'Search for information',
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => searchAPI(query),
    }),
    readPage: tool({
      description: 'Read a web page content',
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => fetchPage(url),
    }),
  },
  maxSteps: 10, // Up to 10 tool-call roundtrips
  onStepFinish({ text, toolCalls, finishReason, usage }) {
    console.log(`Step complete: ${finishReason}, tools: ${toolCalls.length}`);
  },
});

// `steps` array contains the full execution trace
for (const step of steps) {
  console.log(`Step: ${step.finishReason}, tokens: ${step.usage.totalTokens}`);
}
```

### Streaming Agent (streamText + maxSteps)

```typescript
// app/api/agent/route.ts
import { streamText, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 120; // Longer timeout for agents

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-5',
    system: 'You are an AI agent that can search, calculate, and analyze data.',
    messages: await convertToModelMessages(messages),
    tools: {
      calculate: tool({
        description: 'Evaluate a math expression',
        inputSchema: z.object({ expression: z.string() }),
        execute: async ({ expression }) => {
          return { result: eval(expression) }; // Use a safe math parser
        },
      }),
      search: tool({
        description: 'Search the knowledge base',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => searchKB(query),
      }),
    },
    maxSteps: 10,
    onStepFinish({ text, toolCalls, finishReason }) {
      // Log or persist each step
    },
  });

  return result.toUIMessageStreamResponse();
}
```

### Client-Side with useChat + maxSteps

```tsx
'use client';
import { useChat } from '@ai-sdk/react';

export default function AgentChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
    maxSteps: 10, // Client-side must also specify maxSteps
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.parts?.map((part, i) => {
            if (part.type === 'text') return <p key={i}>{part.text}</p>;
            if (part.type === 'tool-invocation') {
              const { toolName, state, args, result } = part.toolInvocation;
              return (
                <div key={i} className="tool-step">
                  <span>🔧 {toolName}({JSON.stringify(args)})</span>
                  {state === 'result' && <pre>{JSON.stringify(result)}</pre>}
                  {state === 'call' && <span>Running...</span>}
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

### AI SDK 5+ stopWhen / stepCountIs Pattern

```typescript
import { generateText, stopWhen, stepCountIs } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Research and summarize...',
  tools: { /* ... */ },
  stopWhen: stepCountIs(20), // Stop after 20 steps max
});
```

> **Guidance**: Use `stepCountIs(2)` for simple tool + response, `stepCountIs(5)` for most cases, `stepCountIs(10-20)` for complex multi-tool agents.

---

## 12. Error Handling in Streaming

### Server-Side: onError Callback (AI SDK 4.2+)

```typescript
const result = streamText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Hello!',
  onError({ error }) {
    // Errors in the stream don't throw — they arrive here
    console.error('Stream error:', error);
    // Log to monitoring, Sentry, etc.
  },
});
```

### Server-Side: Try/Catch for Route Handlers

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: 'anthropic/claude-sonnet-4-5',
      messages: await convertToModelMessages(messages),
      onError({ error }) {
        // Handle mid-stream errors (model timeout, rate limit, etc.)
        console.error('Stream error:', error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Handle pre-stream errors (invalid request, auth failure, etc.)
    console.error('Route handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
```

### Client-Side: useChat onError

```tsx
const { messages, error, reload } = useChat({
  api: '/api/chat',
  onError(error) {
    // Called when the stream fails or the server returns an error
    console.error('Chat error:', error);
    toast.error('Something went wrong. Please try again.');
  },
});

// Display error UI with retry
{error && (
  <div className="error-banner">
    <p>An error occurred.</p>
    <button onClick={reload}>Retry</button>
  </div>
)}
```

### Important: Stream Errors Don't Throw

```typescript
// streamText errors become part of the stream, NOT thrown exceptions.
// This prevents server crashes. Use onError to handle them.

const result = streamText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Hello!',
  onError({ error }) {
    // This is the ONLY way to catch mid-stream errors on the server
  },
});

// toDataStreamResponse / toUIMessageStreamResponse will relay errors
// to the client, where useChat's onError will catch them.
```

---

## 13. Middleware

Language model middleware intercepts and modifies calls to the model.

### Built-in Middleware

```typescript
import {
  wrapLanguageModel,
  extractReasoningMiddleware,
  defaultSettingsMiddleware,
} from 'ai';

// Extract reasoning steps from model output
const modelWithReasoning = wrapLanguageModel({
  model: anthropic('claude-sonnet-4-5'),
  middleware: extractReasoningMiddleware({ tagName: 'thinking' }),
});

// Apply default settings to all calls
const modelWithDefaults = wrapLanguageModel({
  model: anthropic('claude-sonnet-4-5'),
  middleware: defaultSettingsMiddleware({
    maxTokens: 2048,
    temperature: 0.7,
  }),
});
```

### Custom Middleware (logging example)

```typescript
import { wrapLanguageModel } from 'ai';
import type { LanguageModelMiddleware } from 'ai';

const loggingMiddleware: LanguageModelMiddleware = {
  transformParams({ params }) {
    console.log('Model call params:', JSON.stringify(params));
    return params;
  },
  wrapGenerate({ doGenerate }) {
    return async (params) => {
      const start = Date.now();
      const result = await doGenerate(params);
      console.log(`Generation took ${Date.now() - start}ms`);
      return result;
    };
  },
};

const modelWithLogging = wrapLanguageModel({
  model: anthropic('claude-sonnet-4-5'),
  middleware: loggingMiddleware,
});
```

---

## 14. Tips & Gotchas

### maxDuration for Vercel Serverless

```typescript
// Always set this in route handlers to avoid 10s default timeout
export const maxDuration = 30; // seconds (Hobby: max 60, Pro: max 300)
```

### AI SDK 5 Breaking Changes

| v4 API | v5 API |
|---|---|
| `parameters` (tool) | `inputSchema` |
| `import { useChat } from 'ai/react'` | `import { useChat } from '@ai-sdk/react'` |
| `maxSteps` (number) | `stopWhen: stepCountIs(n)` |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` (preferred for useChat) |

### convertToModelMessages

```typescript
// AI SDK 5+ requires converting UI messages to model messages
import { convertToModelMessages } from 'ai';

// In route handlers:
const modelMessages = await convertToModelMessages(messages);
```

### Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...

# Optional: for other providers
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### Zod Schema Tips

```typescript
// Use .describe() to help the model understand fields
const schema = z.object({
  title: z.string().describe('A concise title under 60 characters'),
  tags: z.array(z.string()).describe('3-5 relevant keywords'),
  sentiment: z.enum(['positive', 'negative', 'neutral'])
    .describe('Overall sentiment of the text'),
});
```

### Response Helpers Quick Reference

| Method | Use With | Output |
|---|---|---|
| `toUIMessageStreamResponse()` | `useChat` (SDK 5+) | UI message stream |
| `toDataStreamResponse()` | `useChat` (SDK 4) | Data stream |
| `toTextStreamResponse()` | `useCompletion`, `useObject` | Plain text stream |

---

## Quick Copy-Paste Templates

### Minimal Chat App (2 files)

**`app/api/chat/route.ts`**
```typescript
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: 'anthropic/claude-sonnet-4-5',
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
```

**`app/page.tsx`**
```tsx
'use client';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : ''}>
            <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong>
            {m.parts?.filter(p => p.type === 'text').map((p, i) => (
              <span key={i}>{p.text}</span>
            ))}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Say something..."
        />
        <button type="submit" disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </main>
  );
}
```

---

**Sources**:
- [Vercel AI SDK Docs](https://sdk.vercel.ai/)
- [AI SDK — Vercel Docs](https://vercel.com/docs/ai-sdk)
- [AI SDK 4.2 Blog](https://vercel.com/blog/ai-sdk-4-2)
- [AI SDK 5 Blog](https://vercel.com/blog/ai-sdk-5)
- [AI SDK 6 Blog](https://vercel.com/blog/ai-sdk-6)
- [Anthropic Provider Docs](https://sdk.vercel.ai/docs/ai-core/anthropic)
- [Foundations: Agents](https://sdk.vercel.ai/docs/foundations/agents)
- [Building AI Agents Guide](https://vercel.com/kb/guide/how-to-build-ai-agents-with-vercel-and-the-ai-sdk)
- [Tool Use Academy](https://vercel.com/academy/ai-sdk/tool-use)
- [Basic Chatbot Academy](https://vercel.com/academy/ai-sdk/basic-chatbot)
- [useChat API Reference](https://sdk.vercel.ai/docs/api-reference/use-chat)
- [useCompletion API Reference](https://sdk.vercel.ai/docs/api-reference/use-completion)
