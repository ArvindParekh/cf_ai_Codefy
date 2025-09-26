# Development Guide

## Quick Start

### Option 1: Run Both Servers
```bash
npm run dev:full
```

### Option 2: Run Separately
```bash
# Terminal 1: Start Cloudflare Workers backend
npm run dev:worker

# Terminal 2: Start Next.js frontend  
npm run dev
```

## Configuration

### Environment Variables
Create `.env.local` for development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### Ports
- Next.js Frontend: http://localhost:3000
- Cloudflare Workers Backend: http://localhost:8787
- API Endpoint: http://localhost:8787/agents/simple-code-agent

## Troubleshooting

### 404 Error on API Calls
If you get 404 errors when making API calls:

1. Check both servers are running
2. Verify environment variables
3. Check CORS settings in `src/index.ts`

### Common Issues

**Port Conflicts**:
- Workers default port: 8787
- Next.js default port: 3000

**API Connection**:
- Frontend makes requests to `http://localhost:8787/agents/simple-code-agent`
- Backend serves API at `/agents/simple-code-agent`

## Production Deployment

```bash
npm run deploy
```
