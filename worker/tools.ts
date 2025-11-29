import type { WeatherResult, ErrorResult } from './types';
import { mcpManager } from './mcp-client';
export type ToolResult = WeatherResult | { content: string } | ErrorResult;
interface SerpApiResponse {
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  error?: string;
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          num_results: { type: 'number', description: 'Number of search results to return (default: 5, max: 10)', default: 5 }
        },
        required: ['query']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
const formatSearchResults = (data: SerpApiResponse, query: string, numResults: number): string => {
  if (!data.organic_results || data.organic_results.length === 0) {
    return `No results found for "${query}".`;
  }
  const results = data.organic_results.slice(0, numResults).map((result, index) =>
    `${index + 1}. ${result.title}\n   ${result.snippet}\n   Link: ${result.link}`
  ).join('\n\n');
  return `Search results for "${query}":\n\n${results}`;
};
async function performWebSearch(query: string, apiKey: string, numResults = 5): Promise<string> {
  if (!apiKey) {
    return `Web search requires a SERPAPI_KEY environment variable. Please configure it in your worker.`;
  }
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}&num=${numResults}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Cloudflare-Worker' } });
    if (!response.ok) throw new Error(`SerpAPI request failed with status ${response.status}`);
    const data: SerpApiResponse = await response.json();
    if (data.error) throw new Error(data.error);
    return formatSearchResults(data, query, numResults);
  } catch (error) {
    console.error('SerpAPI search failed:', error);
    return `Failed to perform web search. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
export async function executeTool(name: string, args: Record<string, unknown>, env: { SERPAPI_KEY?: string }): Promise<ToolResult> {
  try {
    switch (name) {
      case 'web_search': {
        const { query, num_results = 5 } = args;
        if (typeof query === 'string') {
          const content = await performWebSearch(query, env.SERPAPI_KEY || '', num_results as number);
          return { content };
        }
        return { error: 'Query parameter is required for web_search' };
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}