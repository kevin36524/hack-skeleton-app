# Spaces CORS Fix - Server-Side Proxy Implementation

## Problem
The direct browser call to Yahoo Mail Autopilot API was blocked by CORS:
```
Access to fetch at 'https://stg-mobile.mail.yahoo.com/yai/autopilot/getSpaces...'
from origin 'https://3000-...' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution
Implemented a server-side proxy pattern through Next.js API routes to bypass CORS restrictions.

## Architecture

### Before (Direct Browser Call - CORS Error)
```
Browser → Yahoo API ❌ CORS blocked
```

### After (Server-Side Proxy - Working)
```
Browser → Next.js API Route → Yahoo API ✅ No CORS issues
```

## Implementation Details

### 1. Client-Side Service (`lib/services/spaces-service.ts`)

**Changed From:**
- Direct fetch to `https://stg-mobile.mail.yahoo.com/yai/autopilot/getSpaces`
- Browser making the CORS-restricted call

**Changed To:**
- Fetch to `/api/spaces` (our Next.js API route)
- Server-side route handles Yahoo API call

**Key Changes:**
```typescript
// OLD: Direct call to Yahoo API
const url = `${SPACES_BASE_URL}/getSpaces?${params.toString()}`;

// NEW: Call to our Next.js API route
const url = `/api/spaces?${params.toString()}`;
```

### 2. Server-Side API Route (`app/api/spaces/route.ts`)

**Updated To:**
- Accept request from browser with authorization header
- Make server-side call to Yahoo Mail Autopilot API
- Forward authorization header to Yahoo API
- Return response back to browser

**Flow:**
1. Receive request from browser with query params and auth header
2. Validate `acctId` parameter (required)
3. Parse optional parameters (`retryCount`, `genAI`)
4. Build Yahoo API URL with all parameters including `appid=YahooMailIosMobile`
5. Make server-side fetch to Yahoo API with authorization header
6. Return Yahoo API response to browser

**Code Structure:**
```typescript
export async function GET(request: NextRequest) {
  // 1. Extract and validate parameters
  const acctId = searchParams.get('acctId');
  const authHeader = request.headers.get('authorization');

  // 2. Build Yahoo API URL
  const yahooUrl = `${SPACES_BASE_URL}/getSpaces?${yahooParams}`;

  // 3. Make server-side request (no CORS issues)
  const response = await fetch(yahooUrl, {
    headers: { 'Authorization': authHeader }
  });

  // 4. Return response to client
  return NextResponse.json(data);
}
```

## Request Flow

### Complete Request Chain

```
1. User loads page with account selected
   │
   ↓
2. SpacesSection component calls spacesService.getSpaces(accountId)
   │
   ↓
3. spacesService makes fetch to /api/spaces?acctId=123
   └─ Headers: Authorization: Bearer <token>
   │
   ↓
4. Next.js API Route (/api/spaces) receives request
   ├─ Validates acctId parameter
   ├─ Extracts Authorization header
   └─ Builds Yahoo API URL
   │
   ↓
5. Server makes fetch to Yahoo API
   └─ URL: https://stg-mobile.mail.yahoo.com/yai/autopilot/getSpaces
   └─ Params: acctId=123&appid=YahooMailIosMobile&retryCount=0&genAI=true
   └─ Headers: Authorization: Bearer <token>
   │
   ↓
6. Yahoo API responds with spaces data
   │
   ↓
7. Next.js API Route returns response to browser
   │
   ↓
8. spacesService receives response
   │
   ↓
9. SpacesSection component updates UI with spaces
```

## Parameters

### Client to Next.js API Route
- **acctId** (required): Account identifier
- **retryCount** (optional): Number of retry attempts (default: 0)
- **genAI** (optional): Whether to use generative AI (default: true)
- **Authorization header** (required): Bearer token

### Next.js API Route to Yahoo API
- **acctId**: Forwarded from client
- **appid**: Always set to `YahooMailIosMobile`
- **retryCount**: Forwarded from client
- **genAI**: Forwarded from client
- **Authorization header**: Forwarded from client

## Error Handling

### 1. Missing acctId
```json
Status: 400
{ "error": "acctId query parameter is required" }
```

### 2. Missing Authorization Header
```json
Status: 401
{ "error": "Authorization header required" }
```

### 3. Invalid retryCount
```json
Status: 400
{ "error": "retryCount must be a valid number" }
```

### 4. Yahoo API Error
```json
Status: <Yahoo API status>
{
  "error": "Failed to fetch spaces from Yahoo API",
  "details": "<error details>"
}
```

### 5. Server Error
```json
Status: 500
{
  "error": "Failed to fetch spaces",
  "details": "<error message>"
}
```

## Logging

The API route includes comprehensive logging for debugging:

```typescript
console.log('[SPACES API] Making request to:', yahooUrl);
console.log('[SPACES API] Response status:', response.status);
console.log('[SPACES API] Success, spaces count:', data.spaces?.length);
console.error('[SPACES API] Error response:', errorText);
console.error('[SPACES API] Error:', error);
```

## Testing

### Test the API Route Directly

Using curl:
```bash
curl -H "Authorization: Bearer <your-token>" \
  "http://localhost:3000/api/spaces?acctId=123456"
```

Using browser console:
```javascript
const token = 'your-token-here';
const response = await fetch('/api/spaces?acctId=123456', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log(data);
```

### Expected Success Response
```json
{
  "spaces": [
    {
      "id": "space-1",
      "name": "Important",
      "description": "High priority emails",
      "messageCount": 42
    },
    {
      "id": "space-2",
      "name": "Shopping",
      "description": "E-commerce and orders",
      "messageCount": 15
    }
  ]
}
```

## Security Considerations

### ✅ What We're Doing Right
1. **Authorization Required**: API route validates authorization header
2. **Parameter Validation**: All parameters are validated before use
3. **No Token Exposure**: Token stays server-side after initial request
4. **Error Sanitization**: Error details are logged but safe for client

### 🔒 Security Features
- Authorization header required for all requests
- Token forwarded securely from client to Yahoo API
- No credentials stored or logged
- Proper error handling without exposing sensitive data

## Why This Approach?

### Alternative Approaches Considered

1. **Use Existing Proxy Route** (`/api/proxy/[...path]`)
   - ❌ Designed for `apis.mail.yahoo.com`, not `stg-mobile.mail.yahoo.com`
   - ❌ Different base URL and path structure
   - ❌ Would require significant modifications

2. **Configure CORS on Yahoo API**
   - ❌ Not possible - Yahoo API doesn't support CORS for browser requests
   - ❌ Security policy set by Yahoo

3. **Use CORS Proxy Service**
   - ❌ Security risk - third-party handles authentication
   - ❌ Reliability concerns
   - ❌ Additional dependency

4. **Current Solution: Next.js API Route** ✅
   - ✅ Full control over implementation
   - ✅ Secure - keeps auth server-side
   - ✅ Easy to debug and maintain
   - ✅ No external dependencies
   - ✅ Follows Next.js best practices

## Performance Considerations

### Latency
- **Added latency**: ~10-50ms for Next.js routing
- **Trade-off**: Necessary to bypass CORS restrictions
- **Mitigation**: Server-side caching could be added if needed

### Caching Strategy (Future Enhancement)
```typescript
// Potential server-side caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache by acctId
const cacheKey = `spaces:${acctId}`;
const cached = cache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.data;
}
```

## Deployment Notes

### Environment Variables
No new environment variables needed. Uses existing authentication token.

### Next.js Configuration
No special configuration required. API routes work out of the box.

### Production Checklist
- ✅ Authorization header validation
- ✅ Parameter validation
- ✅ Error handling
- ✅ Logging for debugging
- ✅ TypeScript types
- ✅ No CORS issues

## Files Modified

### Modified Files
1. **`lib/services/spaces-service.ts`**
   - Changed: URL from Yahoo API to `/api/spaces`
   - Changed: Updated comments to reflect server-side proxy
   - Kept: Authorization header logic
   - Kept: Error handling

2. **`app/api/spaces/route.ts`**
   - Changed: Removed circular dependency on spacesService
   - Added: Direct server-side fetch to Yahoo API
   - Added: Authorization header forwarding
   - Added: Comprehensive logging
   - Added: Detailed error handling

## Summary

✅ **Problem Solved**: CORS errors eliminated
✅ **Architecture**: Clean server-side proxy pattern
✅ **Security**: Authorization properly handled
✅ **Error Handling**: Comprehensive error responses
✅ **Logging**: Detailed logs for debugging
✅ **Testing**: Easy to test and debug
✅ **Performance**: Minimal added latency
✅ **Maintainability**: Clear, well-documented code

The spaces feature now works correctly by routing requests through the Next.js backend, avoiding CORS restrictions while maintaining security and proper error handling.
