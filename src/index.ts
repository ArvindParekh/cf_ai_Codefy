/**
 * AI Code Quality Assistant - Cloudflare Workers API
 */

import { QualityAnalysisState } from './durable-objects/quality-analysis-state';

// Environment interface
export interface Env {
	OPENAI_API_KEY?: string;
	AI_GATEWAY_ACCOUNT_ID?: string;
	AI_GATEWAY_ID?: string;
	QUALITY_ANALYSIS_STATE: DurableObjectNamespace;
	AI: Ai;
}

// Export Durable Objects for Wrangler
export { QualityAnalysisState };

// Helper functions for code analysis and chat
function isCodeAnalysisRequest(content: string): boolean {
	const codePatterns = [
		/```[\s\S]*?```/,  // Code blocks
		/`[^`]+`/,         // Inline code
		/analyze|review|check|security|performance|quality/i,
		/function|class|def|const|let|var|import|export/
	];
	
	return codePatterns.some(pattern => pattern.test(content));
}

async function performCodeAnalysis(content: string, env: Env): Promise<string> {
	try {
		if (!env.AI) {
			throw new Error('Workers AI binding not available');
		}

		const systemPrompt = `You are an expert code quality analyst. Analyze the provided code for security vulnerabilities, performance issues, and quality problems. Provide detailed feedback with:

1. **Security Issues**: Look for injection vulnerabilities, authentication problems, data exposure risks
2. **Performance Issues**: Identify bottlenecks, inefficient algorithms, memory leaks
3. **Quality Issues**: Check code structure, maintainability, best practices

Format your response clearly with specific issues, severity levels (low/medium/high/critical), and actionable recommendations.`;

		const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any, {
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: content }
			],
			max_tokens: 2048,
			temperature: 0.1,
		});

		return (response as any).response || "Analysis completed but no response received.";
	} catch (error) {
		console.error("Code analysis error:", error);
		return "Unable to analyze code at this time. Please try again later.";
	}
}

async function performGeneralChat(content: string, env: Env): Promise<string> {
	try {
		if (!env.AI) {
			throw new Error('Workers AI binding not available');
		}

		const systemPrompt = `You are an AI Code Quality Assistant, a helpful and knowledgeable coding companion. You help developers with:

- Code quality analysis and best practices
- Security, performance, and quality guidance
- Programming language advice
- Debugging and troubleshooting
- General coding questions

Be friendly, professional, and provide practical advice that improves code quality.`;

		const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any, {
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: content }
			],
			max_tokens: 1024,
			temperature: 0.7,
		});

		return (response as any).response || "I'm here to help with your coding questions!";
	} catch (error) {
		console.error("General chat error:", error);
		return "I'm having trouble processing your request. Please try again.";
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		// Handle agent connections and chat
		if (url.pathname.startsWith('/agents/')) {
			try {
				// Get agent type from path
				const agentType = url.pathname.split('/')[2];
				
				if (agentType === 'simple-code-agent') {
					if (request.method === 'POST') {
						const body = await request.json() as { messages: Array<{ role: string; content: string }> };

						if (!body.messages || body.messages.length === 0) {
							return new Response(JSON.stringify({ error: 'No messages provided' }), {
								status: 400,
								headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
							});
						}

						const lastMessage = body.messages[body.messages.length - 1];
						const isCodeAnalysis = isCodeAnalysisRequest(lastMessage.content);

						if (isCodeAnalysis) {
							const analysisResult = await performCodeAnalysis(lastMessage.content, env);
							return new Response(JSON.stringify({
								choices: [{
									delta: { content: analysisResult }
								}]
							}), {
								headers: {
									'Content-Type': 'application/json',
									'Access-Control-Allow-Origin': '*',
									'Cache-Control': 'no-cache'
								}
							});
						} else {
							const chatResponse = await performGeneralChat(lastMessage.content, env);
							return new Response(JSON.stringify({
								choices: [{
									delta: { content: chatResponse }
								}]
							}), {
								headers: {
									'Content-Type': 'application/json',
									'Access-Control-Allow-Origin': '*',
									'Cache-Control': 'no-cache'
								}
							});
						}
					}
				} else {
					return new Response('Unknown agent type', {
						status: 404,
						headers: { 'Access-Control-Allow-Origin': '*' }
					});
				}
			} catch (error) {
				console.error('Agent error:', error);
				return new Response('Agent Error: ' + (error as Error).message, { 
					status: 500,
					headers: { 'Access-Control-Allow-Origin': '*' }
				});
			}
		}

		// API endpoint for direct code analysis
		if (url.pathname === '/api/analyze' && request.method === 'POST') {
			try {
				const { code, language } = await request.json() as { code: string; language?: string };

				if (!code) {
					return new Response(JSON.stringify({ error: 'Code is required' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
					});
				}

				const analysisPrompt = `Please analyze this ${language || 'code'} for security, performance, and quality issues:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
				const analysisResult = await performCodeAnalysis(analysisPrompt, env);

				return new Response(JSON.stringify({
					message: 'Analysis completed',
					analysis: analysisResult
				}), {
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
				});

			} catch (error) {
				return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
				});
			}
		}

		// Health check endpoint
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({
				status: 'healthy',
				service: 'AI Code Quality Assistant',
				version: '1.0.0',
				timestamp: new Date().toISOString(),
				features: ['security-analysis', 'performance-analysis', 'quality-analysis'],
				ai_models: ['llama-3.3-70b-instruct', 'gpt-4']
			}), {
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
			});
		}

		return new Response('Not Found - AI Code Quality Assistant', {
			status: 404,
			headers: { 'Access-Control-Allow-Origin': '*' }
		});
	}
} satisfies ExportedHandler<Env>;
