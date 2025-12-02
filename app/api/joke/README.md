# Joke Agent API

This API provides endpoints to interact with the AI-powered Joke Agent, which can generate various types of jokes based on your requests.

## Base URL

```
http://localhost:3000/api/joke
```

## Endpoints

### 1. Generate Custom Joke (POST)

Generate a joke based on a custom prompt.

**Endpoint:** `POST /api/joke`

**Request Body:**
```json
{
  "prompt": "Tell me a joke about cats",
  "category": "animal" // optional
}
```

**Response:**
```json
{
  "joke": "Why don't cats play poker in the jungle? Too many cheetahs!",
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/joke \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me a dad joke"}'
```

**JavaScript/Fetch Example:**
```javascript
const response = await fetch('http://localhost:3000/api/joke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Tell me a programming joke',
    category: 'programming'
  })
});

const data = await response.json();
console.log(data.joke);
```

---

### 2. Get Random Joke (GET)

Get a random joke, optionally filtered by category.

**Endpoint:** `GET /api/joke`

**Query Parameters:**
- `category` (optional): Filter by joke category (e.g., "dad", "puns", "programming")

**Response:**
```json
{
  "joke": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "category": "random",
  "success": true
}
```

**cURL Examples:**
```bash
# Random joke
curl http://localhost:3000/api/joke

# Dad joke
curl http://localhost:3000/api/joke?category=dad

# Programming joke
curl "http://localhost:3000/api/joke?category=programming"
```

**JavaScript/Fetch Example:**
```javascript
// Random joke
const response = await fetch('http://localhost:3000/api/joke');
const data = await response.json();
console.log(data.joke);

// Category-specific joke
const dadJoke = await fetch('http://localhost:3000/api/joke?category=dad');
const dadData = await dadJoke.json();
console.log(dadData.joke);
```

---

### 3. Get Available Categories (GET)

Get a list of all available joke categories.

**Endpoint:** `GET /api/joke/categories`

**Response:**
```json
{
  "categories": [
    {
      "id": "puns",
      "name": "Puns & Wordplay",
      "description": "Clever wordplay and punny jokes"
    },
    {
      "id": "dad",
      "name": "Dad Jokes",
      "description": "Classic groan-worthy dad humor"
    },
    // ... more categories
  ],
  "success": true
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/joke/categories
```

**JavaScript/Fetch Example:**
```javascript
const response = await fetch('http://localhost:3000/api/joke/categories');
const data = await response.json();
console.log(data.categories);
```

---

## Available Categories

- **puns** - Puns & Wordplay
- **dad** - Dad Jokes
- **knock-knock** - Knock-Knock Jokes
- **one-liner** - One-Liners
- **programming** - Programming Jokes
- **animal** - Animal Jokes
- **food** - Food Jokes
- **science** - Science Jokes

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "success": false,
  "details": "Additional error details"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `500` - Server Error

## Examples in Different Languages

### Python
```python
import requests

# POST request
response = requests.post(
    'http://localhost:3000/api/joke',
    json={'prompt': 'Tell me a science joke'}
)
print(response.json()['joke'])

# GET request
response = requests.get(
    'http://localhost:3000/api/joke',
    params={'category': 'programming'}
)
print(response.json()['joke'])
```

### Node.js (with axios)
```javascript
const axios = require('axios');

// POST request
const postResponse = await axios.post('http://localhost:3000/api/joke', {
  prompt: 'Tell me a knock-knock joke'
});
console.log(postResponse.data.joke);

// GET request
const getResponse = await axios.get('http://localhost:3000/api/joke', {
  params: { category: 'food' }
});
console.log(getResponse.data.joke);
```

### React Example
```jsx
import { useState } from 'react';

function JokeGenerator() {
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);

  const getJoke = async (category) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/joke${category ? `?category=${category}` : ''}`
      );
      const data = await response.json();
      setJoke(data.joke);
    } catch (error) {
      console.error('Error fetching joke:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => getJoke()}>Get Random Joke</button>
      <button onClick={() => getJoke('dad')}>Get Dad Joke</button>
      {loading ? <p>Loading...</p> : <p>{joke}</p>}
    </div>
  );
}
```

## Testing the API

After starting your Next.js development server with `npm run dev`, you can test the API using:

1. **Browser** - Navigate to `http://localhost:3000/api/joke` for a GET request
2. **cURL** - Use the cURL examples provided above
3. **Postman** - Import the endpoints and test them
4. **Your application** - Use the JavaScript/React examples to integrate into your frontend

## Notes

- The joke agent uses AI to generate jokes, so responses may vary
- The agent is family-friendly and appropriate for all audiences
- Response times may vary depending on the complexity of the request
- Make sure your environment variables are properly configured for the AI model
