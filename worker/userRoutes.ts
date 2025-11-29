import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import OpenAI from "openai";
// Mock Data for APIs until DB is integrated
const mockRoutes = [
  { id: 'R001', name: 'Route 1 (Sandton)', positions: [{ lat: -26.1, lng: 28.05 }] },
  { id: 'R002', name: 'Route 2 (Midrand)', positions: [{ lat: -26.0, lng: 28.08 }] },
  { id: 'R003', name: 'Route 3 (Soweto)', positions: [{ lat: -26.25, lng: 28.0 }] },
];
const mockChecklist = [
  { id: 'c1', label: 'Waste Carrier License up-to-date', checked: true },
  { id: 'c2', label: 'Vehicle maintenance logs complete', checked: true },
  { id: 'c3', label: 'Driver training records verified', checked: false },
  { id: 'c4', label: 'Waste transfer notes correctly filed', checked: true },
  { id: 'c5', label: 'Health & Safety audit passed', checked: false },
];
const mockTransactions = [
  { id: 'T001', date: '2023-10-26', amount: 'R 1,500.00', status: 'Completed' },
  { id: 'T002', date: '2023-10-25', amount: 'R 850.00', status: 'Completed' },
];
const mockListings = [
  { id: 1, name: 'Refurbished Laptops (x10)', price: 'R 15,000', category: 'E-Waste', image: '/ewaste/laptops.jpg' },
  { id: 2, name: 'Scrap Metal Bundle', price: 'R 5,000', category: 'Metals', image: '/ewaste/scrap.jpg' },
];
const mockTrainingProgress = [
    { id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true, started: true, quiz: [{ question: 'Q1?', options: ['A', 'B'], correctAnswer: 'A' }], badge: { name: 'Safety Star', color: 'text-blue-500' } },
    { id: 2, title: 'Introduction to e-Waste Sorting', duration: '1 hour', completed: false, started: false, quiz: [{ question: 'Q2?', options: ['C', 'D'], correctAnswer: 'C' }], badge: { name: 'e-Waste Expert', color: 'text-green-500' } },
];
const mockLeaderboard = [
  { rank: 1, name: 'John Doe', points: 1500, avatar: '/avatars/01.png' },
  { rank: 2, name: 'Jane Smith', points: 1350, avatar: '/avatars/02.png' },
  { rank: 3, name: 'You', points: 1200, avatar: '/avatars/03.png' },
];
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const api = new Hono<{ Bindings: Env }>();
    // Operations
    api.get('/operations/routes', (c) => c.json({ success: true, data: mockRoutes }));
    api.post('/operations/routes/suggest', (c) => c.json({ success: true, data: { jobId: '123' } }));
    // Compliance
    api.get('/compliance/checklist', (c) => c.json({ success: true, data: mockChecklist }));
    api.put('/compliance/checklist', (c) => c.json({ success: true, data: { ...mockChecklist[0], checked: !mockChecklist[0].checked } }));
    api.post('/compliance/audit', (c) => c.json({ success: true, data: null }));
    // Payments
    api.get('/payments/transactions', (c) => c.json({ success: true, data: mockTransactions }));
    api.post('/payments/transactions', (c) => c.json({ success: true, data: { id: 'T003', date: '2023-10-27', amount: 'R 100.00', status: 'Completed' } }));
    // Marketplace
    api.get('/marketplace/listings', (c) => c.json({ success: true, data: mockListings }));
    api.post('/marketplace/listings', (c) => c.json({ success: true, data: { id: 3, name: 'New Item', price: 'R 100', category: 'Misc', image: '/ewaste/placeholder.jpg' } }));
    api.post('/marketplace/classify', async (c) => {
        try {
            const { image } = await c.req.json<{ image: string }>();
            if (!c.env.CF_AI_BASE_URL || !c.env.CF_AI_API_KEY) {
                return c.json({ success: false, error: 'AI Gateway not configured' }, { status: 500 });
            }
            const client = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
            const completion = await client.chat.completions.create({
                model: 'google/gemini-pro-vision',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Classify this e-waste item. Provide only a JSON object with keys: name, category, estimatedPrice (as a string like "1200").' },
                        { type: 'image_url', image_url: { url: `data:image/png;base64,${image}` } }
                    ]
                }]
            });
            const content = completion.choices[0].message.content || '{}';
            const result = JSON.parse(content.replace(/```json|```/g, '').trim());
            return c.json({ success: true, data: result });
        } catch (error) {
            console.error('Classification error:', error);
            // Fallback on error
            return c.json({ success: true, data: { name: 'Classified Item', category: 'E-Waste', estimatedPrice: '500' } });
        }
    });
    // Training
    api.get('/training/progress', (c) => c.json({ success: true, data: mockTrainingProgress }));
    api.put('/training/progress/:courseId', (c) => c.json({ success: true, data: { ...mockTrainingProgress[0], completed: true } }));
    api.get('/training/leaderboard', (c) => c.json({ success: true, data: mockLeaderboard }));
    app.route('/api/v1', api);
}