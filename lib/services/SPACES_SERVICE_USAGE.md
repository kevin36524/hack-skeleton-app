# Spaces Service Usage Guide

The Spaces Service provides an interface to the Yahoo Mail Autopilot API for fetching AI-powered email spaces.

## Overview

Spaces is an AI-powered feature that organizes and categorizes emails intelligently. The service provides methods to retrieve spaces for a given account.

## API Endpoint

**Base URL**: `https://stg-mobile.mail.yahoo.com/yai/autopilot`

**Endpoint**: `GET /getSpaces`

**Query Parameters**:
- `acctId` (required) - The account identifier
- `appid` - Application ID (fixed: `YahooMailIosMobile`)
- `retryCount` - Number of retry attempts (default: 0)
- `genAI` - Whether to use generative AI features (default: true)

**Authorization**: Requires Bearer token in Authorization header

## Service Usage

### Import the Service

```typescript
import { spacesService } from '@/lib/services/spaces-service';
```

### Method 1: Get Spaces with Custom Parameters

```typescript
// Fetch spaces with custom retry count and genAI settings
const spacesResponse = await spacesService.getSpaces(
  'account-123',  // acctId
  1,              // retryCount (optional, default: 0)
  false           // genAI (optional, default: true)
);

console.log(`Found ${spacesResponse.spaces.length} spaces`);
```

### Method 2: Get Spaces with Default Parameters

```typescript
// Fetch spaces with default parameters (retryCount=0, genAI=true)
const spacesResponse = await spacesService.getSpacesDefault('account-123');

console.log('Spaces:', spacesResponse.spaces);
```

## Using the API Route

The service is exposed via a Next.js API route at `/api/spaces`.

### API Route Usage

**Endpoint**: `GET /api/spaces`

**Query Parameters**:
- `acctId` (required) - The account identifier
- `retryCount` (optional) - Number of retry attempts (default: 0)
- `genAI` (optional) - Whether to use generative AI features (default: true)

### Examples

#### Basic Request
```bash
curl http://localhost:3000/api/spaces?acctId=account-123
```

#### With Optional Parameters
```bash
curl "http://localhost:3000/api/spaces?acctId=account-123&retryCount=1&genAI=false"
```

#### From Frontend/React Component
```typescript
async function fetchSpaces(acctId: string) {
  try {
    const response = await fetch(`/api/spaces?acctId=${acctId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch spaces');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching spaces:', error);
    throw error;
  }
}

// Usage in a component
const spaces = await fetchSpaces('account-123');
```

#### Using React Query
```typescript
import { useQuery } from '@tanstack/react-query';

function useSpaces(acctId: string) {
  return useQuery({
    queryKey: ['spaces', acctId],
    queryFn: async () => {
      const response = await fetch(`/api/spaces?acctId=${acctId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }
      return response.json();
    },
    enabled: !!acctId,
  });
}

// Usage in a component
function SpacesComponent({ acctId }: { acctId: string }) {
  const { data, isLoading, error } = useSpaces(acctId);

  if (isLoading) return <div>Loading spaces...</div>;
  if (error) return <div>Error loading spaces</div>;

  return (
    <div>
      <h2>Spaces ({data.spaces.length})</h2>
      <ul>
        {data.spaces.map((space) => (
          <li key={space.id}>{space.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Response Format

### Success Response

```typescript
{
  spaces: [
    {
      id: "space-1",
      name: "Important",
      description: "High priority emails",
      messageCount: 42,
      lastUpdated: "2024-01-15T10:30:00Z"
    },
    {
      id: "space-2",
      name: "Shopping",
      description: "E-commerce and order confirmations",
      messageCount: 15,
      lastUpdated: "2024-01-14T08:15:00Z"
    }
  ]
}
```

### Error Response

```typescript
{
  error: "Failed to fetch spaces",
  details: "No authorization token available"
}
```

## TypeScript Types

The service uses the following TypeScript types defined in `@/lib/types/api`:

```typescript
export interface Space {
  id: string;
  name: string;
  description?: string;
  messageCount?: number;
  lastUpdated?: string;
  [key: string]: unknown;
}

export interface GetSpacesApiResponse {
  spaces: Space[];
  [key: string]: unknown;
}
```

## Error Handling

The service throws errors in the following scenarios:

1. **No Authorization Token**: When the API client doesn't have a token set
2. **API Request Fails**: When the HTTP request fails (network error, timeout, etc.)
3. **Non-2xx Response**: When the API returns an error status code

### Example Error Handling

```typescript
try {
  const spaces = await spacesService.getSpaces('account-123');
  console.log('Spaces loaded successfully:', spaces);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('No authorization token')) {
      console.error('User is not authenticated');
      // Redirect to login
    } else if (error.message.includes('404')) {
      console.error('Account not found');
    } else {
      console.error('Failed to load spaces:', error.message);
    }
  }
}
```

## Authentication

The service uses the authorization token from the `apiClient` singleton. Make sure to set the token before calling the service:

```typescript
import { apiClient } from '@/lib/services/api-client';

// Set the token (typically done after login)
apiClient.setToken('your-bearer-token-here');

// Now you can use the spaces service
const spaces = await spacesService.getSpaces('account-123');
```

## Notes

- The Spaces API uses a different base URL (`stg-mobile.mail.yahoo.com`) than the standard Yahoo Mail API
- The `appid` parameter is automatically set to `YahooMailIosMobile`
- The service fetches directly from the Yahoo API, not through the proxy endpoint
- Authorization headers are automatically added using the token from `apiClient`
