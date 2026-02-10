# Gmail OAuth Migration Plan

## Overview

This document outlines the complete plan for migrating the mail prototype from Yahoo Mail to Gmail, with OAuth 2.0 authentication that works seamlessly with changing sandbox URLs by using a **stateless** OAuth bridge domain (`hack.oath.email`).

**🔒 Security Model**: All tokens are stored client-side only. The OAuth bridge is completely stateless and never stores tokens - it only facilitates the OAuth flow and proxies token refresh requests.

## Architecture Overview

```
┌─────────────────────┐
│  Sandbox Frontend   │
│  (Dynamic URL)      │
│  localStorage: 🔑   │
└──────────┬──────────┘
           │
           │ 1. Redirect to OAuth
           ▼
┌─────────────────────┐
│  hack.oath.email    │
│  (Stateless Bridge) │
│  No token storage ❌│
└──────────┬──────────┘
           │
           │ 2. OAuth Flow
           ▼
┌─────────────────────┐
│  Google OAuth       │
│  (accounts.google)  │
└──────────┬──────────┘
           │
           │ 3. Callback with code
           ▼
┌─────────────────────┐
│  hack.oath.email    │
│  Exchange & Return  │
└──────────┬──────────┘
           │
           │ 4. Tokens via postMessage
           ▼
┌─────────────────────┐
│  Sandbox Frontend   │
│  Store in localStorage
│  🔑 access_token    │
│  🔄 refresh_token   │
└─────────────────────┘
```

**Key Principle**: Tokens flow through the bridge but are never persisted on the server.

---

## Phase 1: Google Cloud Platform (GCP) Setup

### 1.1 Create/Configure GCP Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
   - Create a new project or select existing one
   - Project Name: `hack-mail` (or your preferred name)
   - Note down the Project ID

2. **Enable Required APIs**
   - Navigate to "APIs & Services" > "Library"
   - Search and enable:
     - **Gmail API** - For email operations
     - **Google Calendar API** - For calendar read permissions

3. **Configure OAuth Consent Screen**
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - User Type:
     - **External** (for testing with any Google account)
     - **Internal** (if you have Google Workspace and want to restrict to your organization)

   - App Information:
     ```
     App name: Hack Mail
     User support email: your-email@domain.com
     Developer contact: your-email@domain.com
     App logo: (optional, 120x120px)
     ```

   - Scopes:
     - Click "Add or Remove Scopes"
     - Add the following scopes:
       ```
       https://www.googleapis.com/auth/gmail.readonly
       https://www.googleapis.com/auth/gmail.modify
       https://www.googleapis.com/auth/gmail.compose
       https://www.googleapis.com/auth/calendar.readonly
       https://www.googleapis.com/auth/userinfo.email
       https://www.googleapis.com/auth/userinfo.profile
       ```

   - Test Users (for External apps):
     - Add your test Gmail accounts
     - Max 100 test users before publishing

### 1.2 Create OAuth 2.0 Credentials

1. **Navigate to "APIs & Services" > "Credentials"**
2. **Click "Create Credentials" > "OAuth client ID"**
3. **Application type**: Web application
4. **Name**: `hack-mail-oauth-client`
5. **Authorized JavaScript origins**:
   ```
   https://hack.oath.email
   http://localhost:3000 (for local testing)
   ```
6. **Authorized redirect URIs**:
   ```
   https://hack.oath.email/api/auth/sandbox/callback/google
   http://localhost:3000/api/auth/sandbox/callback/google (for local testing)
   ```

   **Note**: This follows your existing auth path convention. Your platform auth uses `/api/auth/callback/google`, and sandbox OAuth uses `/api/auth/sandbox/callback/google`.
7. **Download credentials JSON** - Save this securely, you'll need:
   - `client_id`
   - `client_secret`

### 1.3 Important Security Notes

- **Keep client_secret secure** - Store only on hack.oath.email server, never in frontend
- **No token storage on server** - Bridge is stateless, tokens go directly to client
- **Use HTTPS everywhere** - Protect tokens in transit
- **Implement PKCE** - Proof Key for Code Exchange for additional security (optional but recommended)
- **Short-lived sessions** - OAuth flow session expires in 10 minutes

---

## Phase 2: hack.oath.email Server Setup

### 2.1 Server Technology Stack Recommendation

**Option A: Node.js/Express (Recommended)**
- Familiar ecosystem
- Good OAuth libraries available
- Easy to deploy
- **Stateless by design**

**Option B: Python/Flask**
- Simple and lightweight
- Good Google API client libraries

**We'll proceed with Node.js/Express for this plan.**

**Important**: This server is **completely stateless** except for temporary OAuth sessions (10 min lifetime). No user data or tokens are persisted.

### 2.2 Directory Structure

```
hack-oath-email-server/
├── src/
│   ├── index.ts                 # Main server file
│   ├── routes/
│   │   └── auth/
│   │       └── sandbox.ts       # Sandbox OAuth routes (stateless)
│   ├── api/
│   │   └── token.ts             # Token refresh proxy
│   ├── services/
│   │   └── google-oauth.ts      # Google OAuth service
│   ├── middleware/
│   │   └── validate.ts          # Request validation
│   └── config/
│       └── google.ts            # Google OAuth config
├── .env                         # Environment variables
├── package.json
└── tsconfig.json
```

**Note**: No `token-manager.ts` or database - server is completely stateless!

### 2.3 Environment Variables

Create `.env` file:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGINS=*  # Allow all sandbox domains

# Google OAuth - Sandbox Mail App
SANDBOX_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
SANDBOX_GOOGLE_CLIENT_SECRET=your-client-secret
SANDBOX_GOOGLE_REDIRECT_URI=https://hack.oath.email/api/auth/sandbox/callback/google

# Session Secret (for temporary OAuth state only)
SESSION_SECRET=your-session-secret

# NO DATABASE - Server is stateless!
# NO TOKEN STORAGE - Tokens go directly to client!
```

**Note**: No Redis, no database, no token encryption keys needed!

### 2.4 Core Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "googleapis": "^130.0.0",
    "express-session": "^1.17.3",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "memorystore": "^1.6.7"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0"
  }
}
```

**Note**: `memorystore` for temporary session storage (OAuth state only). No crypto-js needed!

### 2.5 Server Implementation

#### 2.5.1 Main Server (`src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import MemoryStore from 'memorystore';

import sandboxAuthRoutes from './routes/auth/sandbox';
import tokenRoutes from './api/token';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Memory store for temporary session storage only
const SessionStore = MemoryStore(session);

// Security middleware
app.use(helmet());

// CORS - Allow all origins since sandbox URLs are dynamic
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management (ONLY for temporary OAuth state - max 10 minutes)
app.use(session({
  store: new SessionStore({
    checkPeriod: 86400000 // Prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 10 * 60 * 1000 // 10 minutes - OAuth flow only
  }
}));

// Routes
app.use('/api/auth/sandbox', sandboxAuthRoutes);
app.use('/api/token', tokenRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stateless: true, // Indicate this is a stateless service
    tokenStorage: 'none' // No tokens stored on server
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🔒 Stateless OAuth bridge running on port ${PORT}`);
  console.log(`⚡ No token storage - client-side only`);
});
```

#### 2.5.2 Google OAuth Service (`src/services/google-oauth.ts`)

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.SANDBOX_GOOGLE_CLIENT_ID,
  process.env.SANDBOX_GOOGLE_CLIENT_SECRET,
  process.env.SANDBOX_GOOGLE_REDIRECT_URI
);

export class GoogleOAuthService {
  // Generate OAuth URL
  static getAuthUrl(state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline', // Gets refresh token
      scope: scopes,
      state: state,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  // Exchange authorization code for tokens
  static async getTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  }

  // Get user info
  static async getUserInfo(accessToken: string) {
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
  }
}
```

#### 2.5.3 Sandbox OAuth Routes (`src/routes/auth/sandbox.ts`)

```typescript
import { Router } from 'express';
import { GoogleOAuthService } from '../services/google-oauth';
import crypto from 'crypto';

const router = Router();

// Store state->origin mapping in session for security
declare module 'express-session' {
  interface SessionData {
    oauthState: string;
    returnUrl: string;
  }
}

/**
 * Endpoint 1: Initiate OAuth Flow
 * Path: /api/auth/sandbox/start
 * Frontend redirects user here with returnUrl
 */
router.get('/start', (req, res) => {
  const returnUrl = req.query.returnUrl as string;

  if (!returnUrl) {
    return res.status(400).json({ error: 'returnUrl is required' });
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');

  // Store state and return URL in session
  req.session.oauthState = state;
  req.session.returnUrl = returnUrl;

  // Generate Google OAuth URL
  const authUrl = GoogleOAuthService.getAuthUrl(state);

  // Redirect user to Google
  res.redirect(authUrl);
});

/**
 * Endpoint 2: OAuth Callback
 * Path: /api/auth/sandbox/callback/google
 * Google redirects here after user authorizes
 */
router.get('/callback/google', async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error as string;

  // Check for errors
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`${req.session.returnUrl}?error=${error}`);
  }

  // Verify state to prevent CSRF
  if (state !== req.session.oauthState) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }

  try {
    // Exchange code for tokens
    const tokens = await GoogleOAuthService.getTokens(code);

    // Get user info
    const userInfo = await GoogleOAuthService.getUserInfo(tokens.access_token!);

    // Redirect to done endpoint with tokens
    const returnUrl = req.session.returnUrl!;
    const params = new URLSearchParams({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expires_in: tokens.expiry_date!.toString(),
      email: userInfo.email!,
      name: userInfo.name || '',
      picture: userInfo.picture || '',
    });

    // Clear session
    req.session.destroy(() => {});

    // Redirect to done endpoint
    res.redirect(`/api/auth/sandbox/done?${params.toString()}`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.redirect(`${req.session.returnUrl}?error=token_exchange_failed`);
  }
});

/**
 * Endpoint 3: OAuth Done
 * Path: /api/auth/sandbox/done
 * This page sends tokens back to the sandbox frontend
 */
router.get('/done', (req, res) => {
  // Extract tokens from query params
  const {
    access_token,
    refresh_token,
    expires_in,
    email,
    name,
    picture,
    error
  } = req.query;

  // Render HTML page that posts tokens back to opener
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Complete</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 400px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error {
          color: #dc3545;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>Authentication Complete</h2>
        <p>Redirecting back to your app...</p>
        <p class="error" id="error"></p>
      </div>

      <script>
        (function() {
          const error = '${error || ''}';

          if (error) {
            document.getElementById('error').textContent = 'Error: ' + error;
            setTimeout(() => window.close(), 3000);
            return;
          }

          // Prepare token data
          const tokenData = {
            access_token: '${access_token}',
            refresh_token: '${refresh_token}',
            expires_in: ${expires_in},
            email: '${email}',
            name: '${name}',
            picture: '${picture}',
            timestamp: Date.now()
          };

          // If opened in a popup, send message to opener
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              data: tokenData
            }, '*');

            setTimeout(() => window.close(), 1000);
          } else {
            // Fallback: store in localStorage and redirect
            localStorage.setItem('gmail_oauth_tokens', JSON.stringify(tokenData));
            window.location.href = '/';
          }
        })();
      </script>
    </body>
    </html>
  `);
});

export default router;
```

#### 2.5.4 Token Refresh Routes (`src/api/token.ts`)

```typescript
import { Router } from 'express';
import { GoogleOAuthService } from '../services/google-oauth';

const router = Router();

/**
 * Endpoint: Refresh Access Token (Stateless Proxy)
 * POST /api/token/refresh
 * Note: This is at /api/token/refresh, not under /api/auth/sandbox/
 *
 * IMPORTANT: This endpoint does NOT store tokens!
 * It simply proxies the refresh request to Google and returns new tokens to the client.
 * The client is responsible for storing the new tokens.
 */
router.post('/token/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  try {
    // Call Google to refresh the token (no storage on our end)
    const tokens = await GoogleOAuthService.refreshAccessToken(refresh_token);

    // Return new tokens directly to client
    res.json({
      access_token: tokens.access_token,
      expires_in: tokens.expiry_date,
      token_type: 'Bearer',
      // Note: Google may not return a new refresh_token if the old one is still valid
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token })
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Failed to refresh token',
      message: 'Please re-authenticate',
      code: 'REFRESH_FAILED'
    });
  }
});

/**
 * Endpoint: Validate Token (Stateless)
 * POST /api/token/validate
 *
 * IMPORTANT: This endpoint does NOT store tokens!
 * It simply checks if a token is valid with Google.
 */
router.post('/token/validate', async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'access_token is required' });
  }

  try {
    const userInfo = await GoogleOAuthService.getUserInfo(access_token);
    res.json({
      valid: true,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    });
  } catch (error) {
    res.json({ valid: false });
  }
});

export default router;
```

### 2.6 Deployment Options for hack.oath.email

**Option A: Vercel**
- Easy deployment
- Free tier available
- Good for serverless

**Option B: Railway/Render**
- Better for persistent connections
- Good Redis integration

**Option C: Traditional VPS (DigitalOcean, AWS EC2)**
- More control
- Can run background jobs

### 2.7 DNS Configuration

1. Point `hack.oath.email` A record to your server IP
2. Set up SSL certificate (Let's Encrypt via Certbot)
3. Configure HTTPS redirect

---

## Phase 3: Next.js Frontend Changes

### 3.1 Update Authentication Context

**File: `lib/auth-context.tsx`**

Changes needed:
1. Replace `TOKEN_STORAGE_KEY` with Gmail tokens
2. Store both access_token and refresh_token
3. Add token expiry tracking
4. Add token refresh logic

```typescript
interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp (milliseconds)
  email: string;
  name?: string;
  picture?: string;
}

const TOKEN_STORAGE_KEY = 'gmail_oauth_tokens';
const OAUTH_BRIDGE_URL = 'https://hack.oath.email';

// Store tokens in localStorage (plaintext is fine - see security note below)
const storeTokens = (tokens: TokenData): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
};

// Get stored tokens
const getStoredTokens = (): TokenData | null => {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored tokens:', error);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (tokenData: TokenData): boolean => {
  // Add 5 minute buffer before expiry
  return Date.now() >= (tokenData.expires_at - 5 * 60 * 1000);
};

// Refresh access token via stateless proxy
const refreshAccessToken = async (tokenData: TokenData): Promise<TokenData> => {
  const response = await fetch(`${OAUTH_BRIDGE_URL}/api/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: tokenData.refresh_token })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Token refresh failed');
  }

  const data = await response.json();
  const newTokenData: TokenData = {
    ...tokenData,
    access_token: data.access_token,
    expires_at: data.expires_in,
    // Update refresh_token if Google returns a new one
    ...(data.refresh_token && { refresh_token: data.refresh_token })
  };

  // Store the new tokens
  storeTokens(newTokenData);
  return newTokenData;
};

// Get valid access token (auto-refresh if expired)
const getValidAccessToken = async (): Promise<string | null> => {
  let tokenData = getStoredTokens();
  if (!tokenData) return null;

  // Refresh if expired
  if (isTokenExpired(tokenData)) {
    try {
      tokenData = await refreshAccessToken(tokenData);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear invalid tokens
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
  }

  return tokenData.access_token;
};
```

**Security Note**: Tokens are stored in plaintext localStorage. This is acceptable because:
- If XSS exists, encryption provides no protection (attacker can read JS code)
- Real security comes from: XSS prevention, HTTPS, short-lived tokens, and proper CSP
- Encryption adds complexity without meaningful security benefit

### 3.2 Update Login Page

**File: `app/login/page.tsx`**

Replace token input with OAuth flow:

```typescript
const handleGoogleLogin = () => {
  const returnUrl = encodeURIComponent(window.location.origin);
  const oauthUrl = `${OAUTH_BRIDGE_URL}/api/auth/sandbox/start?returnUrl=${returnUrl}`;

  // Open popup
  const popup = window.open(
    oauthUrl,
    'google_oauth',
    'width=500,height=600'
  );

  // Listen for message from popup
  const messageHandler = (event: MessageEvent) => {
    if (event.data.type === 'OAUTH_SUCCESS') {
      const tokenData = event.data.data;
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      login(tokenData);
      window.removeEventListener('message', messageHandler);
    }
  };

  window.addEventListener('message', messageHandler);
};
```

### 3.3 Update API Client

**File: `lib/services/api-client.ts`**

Changes needed:
1. Update base URL to Gmail API
2. Update token handling for OAuth tokens
3. Add automatic token refresh on 401 errors

```typescript
const BASE_URL = 'https://gmail.googleapis.com/gmail/v1';

// In request method, add token refresh logic
if (response.status === 401) {
  // Try to refresh token
  const tokenData = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || '{}');
  const newTokenData = await refreshToken(tokenData);
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokenData));

  // Retry request with new token
  return this.request(endpoint, options);
}
```

### 3.4 Update Message Service for Gmail API

**File: `lib/services/message-service.ts`**

Gmail API uses different endpoints:
- List messages: `GET /users/me/messages`
- Get message: `GET /users/me/messages/{id}`
- Modify message: `POST /users/me/messages/{id}/modify`

You'll need to map Yahoo API calls to Gmail API equivalents.

### 3.5 Environment Variables

**File: `.env.local`**

```bash
NEXT_PUBLIC_OAUTH_BRIDGE_URL=https://hack.oath.email
NEXT_PUBLIC_GMAIL_API_URL=https://gmail.googleapis.com/gmail/v1
NEXT_PUBLIC_CALENDAR_API_URL=https://www.googleapis.com/calendar/v3
```

---

## Phase 4: Testing Plan

### 4.1 Local Testing Setup

1. **Set up local OAuth bridge server**
   - Use `http://localhost:3000` as redirect URI
   - Add to Google OAuth allowed origins

2. **Test OAuth flow**
   - Initiate OAuth from sandbox
   - Verify popup opens correctly
   - Verify tokens are received
   - Verify tokens are stored in localStorage

3. **Test token refresh**
   - Wait for token to expire (or manually expire it)
   - Verify automatic refresh works

### 4.2 Production Testing

1. **Deploy OAuth bridge to hack.oath.email**
2. **Update Google OAuth settings** with production URLs
3. **Test with real sandbox URLs**
4. **Verify cross-domain communication works**

---

## Phase 5: Security Considerations

### 5.1 Token Storage (Client-Side Only)

**Current Architecture: Plaintext localStorage**
- ✅ **localStorage** - Tokens stored only in user's browser
- ✅ **Privacy First** - No server-side token storage
- ⚠️ **XSS Risk** - Vulnerable if XSS vulnerability exists

**Why NOT Encrypt Tokens Client-Side?**

Client-side encryption is **security theater** and doesn't actually help:

1. **XSS Attack Scenario:**
   - Attacker can read your encryption code
   - Attacker can hook into API calls after decryption
   - Attacker can intercept tokens when they're used
   - Encryption provides zero protection

2. **Network Snooping:**
   - Tokens are plaintext in Authorization headers
   - Tokens sent via postMessage during OAuth
   - HTTPS already encrypts in transit
   - Client-side encryption doesn't help here

3. **localStorage Access:**
   - If someone has file system access to read localStorage, game over anyway
   - They likely have more serious problems (malware, physical access)

**Real Security Measures (What Actually Works):**

### 5.2 XSS Prevention (Most Important!)

**This is your primary defense. Focus here:**

1. **Content Security Policy (CSP)**
   ```typescript
   // Add to Next.js config or middleware
   const csp = `
     default-src 'self';
     script-src 'self' 'unsafe-eval' 'unsafe-inline';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: https:;
     connect-src 'self' https://gmail.googleapis.com https://hack.oath.email;
   `;
   ```

2. **Input Sanitization**
   - Sanitize all user input
   - Use React's built-in XSS protection (don't use dangerouslySetInnerHTML)
   - Validate and encode email content

3. **Dependency Security**
   - Run `npm audit` regularly
   - Keep dependencies updated
   - Use Dependabot or similar

### 5.3 HTTPS Everywhere

- ✅ **HTTPS on all domains** - Encrypts tokens in transit
- ✅ **HSTS headers** - Force HTTPS
- ✅ **Valid SSL certificates** - No self-signed certs

### 5.4 OAuth Security

**State Parameter:**
- ✅ **Always validate** state parameter in OAuth callback
- ✅ **Cryptographically random** - Use crypto.randomBytes(32)
- ✅ **Short-lived** - Session expires in 10 minutes
- 🔒 **Prevents CSRF attacks**

**Redirect URI Validation:**
- ✅ Validate returnUrl against whitelist (optional)
- ⚠️ Or accept any origin (for dynamic sandboxes, less secure)

### 5.5 Token Security

**Short-Lived Tokens:**
- ✅ Access tokens expire in 1 hour (Google default)
- ✅ Auto-refresh before expiry (5 min buffer)
- ✅ Refresh tokens don't expire but can be revoked

**Token Transmission:**
- ✅ postMessage with origin validation during OAuth callback
- ✅ HTTPS for all API calls
- ✅ Bearer token in Authorization header

### 5.6 Rate Limiting

- ✅ **OAuth endpoints** - 100 requests per 15 minutes per IP
- ✅ **Token refresh** - Same rate limit
- ✅ **Prevents abuse** - Protects against credential stuffing

### 5.7 CORS Configuration

- ⚠️ **Allow all origins** - Necessary for dynamic sandbox URLs
- ✅ **Credentials enabled** - For session cookies (OAuth state only)
- Consider restricting to known domains if possible

---

## Alternative Approaches & Recommendations

### Your Chosen Approach: Stateless OAuth Bridge ✅

**Architecture:**
- OAuth bridge at hack.oath.email (stateless)
- All tokens stored client-side only
- Token refresh via stateless proxy

**Pros:**
- ✅ **Privacy-first** - No server-side token storage
- ✅ **Simple** - No database or user management needed
- ✅ **Works with dynamic URLs** - Stable OAuth endpoint
- ✅ **Transparent** - Users control their tokens
- ✅ **Scalable** - Stateless server scales easily

**Cons:**
- ⚠️ **XSS vulnerability** - If XSS exists, tokens can be stolen
- ⚠️ **No revocation** - Can't revoke tokens server-side
- ⚠️ **Token loss** - If localStorage cleared, must re-authenticate

**Mitigation:**
- 🔒 **XSS Prevention** - Use CSP, sanitize inputs, secure dependencies
- 🔒 **HTTPS Everywhere** - Encrypt in transit
- 🔒 **Short-lived tokens** - Access tokens expire in 1 hour
- 🔒 **Auto-refresh** - Transparent token renewal

### Alternative 1: Chrome Extension for Token Management

**Pros:**
- More secure token storage
- Works across all domains
- Can handle OAuth independently

**Cons:**
- Requires users to install extension
- More complex to maintain

**Recommendation**: Consider for power users, but the OAuth bridge is simpler for most users.

### Alternative 2: Next.js API Routes for OAuth

**Pros:**
- No separate server needed
- Everything in one codebase

**Cons:**
- Won't solve the changing sandbox URL problem
- Each sandbox instance would need separate OAuth credentials

**Recommendation**: Not suitable for your use case due to dynamic URLs.

### Alternative 3: Service Worker for Token Management

**Pros:**
- More secure than localStorage
- Can intercept API requests
- Better token refresh handling

**Cons:**
- More complex implementation
- Browser support considerations

**Recommendation**: Consider as future enhancement if security concerns grow.

### Why Your Chosen Approach is Good

1. **Privacy-first** - You don't store user tokens ✅
2. **Simple architecture** - Easy to maintain ✅
3. **Solves the core problem** - Works with dynamic sandbox URLs ✅
4. **Scalable** - Stateless server scales horizontally ✅
5. **Transparent** - Users know where their tokens are ✅

---

## Implementation Timeline

### Week 1: Setup & Infrastructure
- [ ] Create GCP project and configure OAuth
- [ ] Set up hack.oath.email server
- [ ] Deploy OAuth bridge server
- [ ] Configure DNS and SSL

### Week 2: Backend Integration
- [ ] Implement OAuth endpoints
- [ ] Add token refresh logic
- [ ] Test OAuth flow locally

### Week 3: Frontend Integration
- [ ] Update auth context
- [ ] Update login page
- [ ] Update API client
- [ ] Add popup OAuth flow

### Week 4: Gmail API Migration
- [ ] Update message service for Gmail API
- [ ] Update mailbox service
- [ ] Update folder service
- [ ] Test all API endpoints

### Week 5: Testing & Refinement
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation

---

## Monitoring & Maintenance

### Key Metrics to Track
- OAuth success rate
- Token refresh failures (indicates need to re-authenticate)
- API error rates
- Authentication failures

### Logging Strategy

**What to Log:**
- ✅ OAuth flow attempts (success/failure)
- ✅ Token refresh attempts
- ✅ API rate limit hits
- ✅ Error patterns

**What NOT to Log:**
- ❌ Tokens (access or refresh)
- ❌ User email addresses (unless anonymized)
- ❌ OAuth codes
- ❌ Client secrets

**Example Log Entry:**
```json
{
  "timestamp": "2026-02-10T12:34:56Z",
  "event": "oauth_success",
  "session_id": "abc123",  // Temporary session ID
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "duration_ms": 2341
}
```

### Alerts to Set Up
- OAuth service downtime
- High error rates on token refresh
- Google API quota exceeded
- SSL certificate expiry
- Unusual traffic patterns

### Privacy Considerations
- No user tracking across sessions
- No analytics on which emails users read
- No token storage or logging
- Session data purged after 10 minutes

---

## Migration Checklist

- [ ] GCP project created
- [ ] Gmail API enabled
- [ ] Calendar API enabled
- [ ] OAuth credentials configured
- [ ] OAuth consent screen configured
- [ ] hack.oath.email server deployed
- [ ] SSL certificate configured
- [ ] OAuth endpoints implemented
- [ ] Token refresh endpoint implemented
- [ ] Frontend auth updated
- [ ] API client updated
- [ ] Gmail API integration complete
- [ ] Testing complete
- [ ] Documentation updated
- [ ] Monitoring set up

---

## Appendix: Useful Resources

### Documentation
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google OAuth Playground](https://developers.google.com/oauthplayground/)

### Libraries
- [googleapis](https://www.npmjs.com/package/googleapis) - Official Google APIs Node.js client
- [google-auth-library](https://www.npmjs.com/package/google-auth-library) - Google's auth library for Node.js

### Tools
- [OAuth 2.0 Debugger](https://oauthdebugger.com/)
- [JWT.io](https://jwt.io/) - Decode and verify JWTs
- [Postman](https://www.postman.com/) - Test API endpoints

---

## Questions to Consider

1. **User Management**: Do you need to support multiple Google accounts per user?
2. **Data Storage**: Will you cache email data? If so, where?
3. **Offline Support**: Should the app work offline with cached data?
4. **Real-time Updates**: Do you need real-time email notifications?
5. **Calendar Integration**: What calendar features do you need?
6. **Multi-tenancy**: Will different users/organizations use different OAuth apps?

---

*Last Updated: 2026-02-10*
