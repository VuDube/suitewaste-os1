import { Hono, Next, Context } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController } from "./core-utils";
import OpenAI from "openai";
import { AppController } from "./app-controller";
// Define a typed context for our middleware
type AppContext = {
    Variables: {
        userId: string;
        controller: any;
    };
    Bindings: Env;
};
const initialUserData = {
    routes: [
        { id: 'R001', name: 'Route 1 (Sandton)', positions: [{ lat: -26.1, lng: 28.05 }] },
        { id: 'R002', name: 'Route 2 (Midrand)', positions: [{ lat: -26.0, lng: 28.08 }] },
        { id: 'R003', name: 'Route 3 (Soweto)', positions: [{ lat: -26.25, lng: 28.0 }] },
    ],
    checklist: [
        { id: 'c1', label: 'Waste Carrier License up-to-date', checked: true },
        { id: 'c2', label: 'Vehicle maintenance logs complete', checked: true },
        { id: 'c3', label: 'Driver training records verified', checked: false },
        { id: 'c4', label: 'Waste transfer notes correctly filed', checked: true },
        { id: 'c5', label: 'Health & Safety audit passed', checked: false },
    ],
    transactions: [
        { id: 'T001', date: '2023-10-26', amount: 'R 1,500.00', status: 'Completed' },
        { id: 'T002', date: '2023-10-25', amount: 'R 850.00', status: 'Completed' },
    ],
    listings: [
        { id: 1, name: 'Refurbished Laptops (x10)', price: 'R 15,000', category: 'E-Waste', image: '/ewaste/laptops.jpg' },
        { id: 2, name: 'Scrap Metal Bundle', price: 'R 5,000', category: 'Metals', image: '/ewaste/scrap.jpg' },
    ],
    trainingProgress: [
        { id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true, started: true, score: 1.0, quiz: [{ question: 'Q1?', options: ['A', 'B'], correctAnswer: 'A' }], badge: { name: 'Safety Star', color: 'text-blue-500' } },
        { id: 2, title: 'Introduction to e-Waste Sorting', duration: '1 hour', completed: false, started: false, score: 0, quiz: [{ question: 'Q2?', options: ['C', 'D'], correctAnswer: 'C' }], badge: { name: 'e-Waste Expert', color: 'text-green-500' } },
    ],
    leaderboard: [
        { rank: 1, name: 'John Doe', points: 1500, avatar: '/avatars/01.png' },
        { rank: 2, name: 'Jane Smith', points: 1350, avatar: '/avatars/02.png' },
        { rank: 3, name: 'You', points: 1200, avatar: '/avatars/03.png' },
    ]
};
async function getUserState(controller: any, userId: string): Promise<Record<string, any>> {
    let state = await controller.getState(userId);
    if (!state || Object.keys(state).length === 0) {
        await controller.setState(userId, initialUserData as any);
        state = initialUserData as any;
    }
    return state;
}
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
    const api = new Hono<AppContext>();
    api.use('*', async (c, next) => {
        const userId = c.req.header('user-id') || 'default-user';
        const controller = getAppController(c.env);
        c.set('userId', userId);
        c.set('controller', controller);
        await next();
    });
    // Operations
    api.get('/operations/routes', async (c) => {
        const state = await getUserState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.routes || [] });
    });
    api.post('/operations/routes/suggest', (c) => c.json({ success: true, data: { jobId: '123' } }));
    // Compliance
    api.get('/compliance/checklist', async (c) => {
        const state = await getUserState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.checklist || [] });
    });
    api.put('/compliance/checklist', async (c) => {
        const { id, checked } = await c.req.json<{ id: string; checked: boolean }>();
        const controller = c.var.controller;
        const userId = c.var.userId;
        const state = await getUserState(controller, userId);
        const updatedChecklist = state.checklist.map((item: any) => item.id === id ? { ...item, checked } : item);
        await controller.setState(userId, { ...state, checklist: updatedChecklist });
        return c.json({ success: true, data: updatedChecklist.find((item: any) => item.id === id) });
    });
    api.post('/compliance/audit', (c) => c.json({ success: true, data: null }));
    // Payments
    api.get('/payments/transactions', async (c) => {
        const state = await getUserState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.transactions || [] });
    });
    api.post('/payments/transactions', async (c) => {
        const { amount } = await c.req.json<{ amount: string }>();
        const controller = c.var.controller;
        const userId = c.var.userId;
        const state = await getUserState(controller, userId);
        const newTransaction = { id: `T${Date.now()}`, date: new Date().toISOString().split('T')[0], amount: `R ${amount}`, status: 'Completed' };
        const updatedTransactions = [...state.transactions, newTransaction];
        await controller.setState(userId, { ...state, transactions: updatedTransactions });
        return c.json({ success: true, data: newTransaction });
    });
    // Marketplace
    api.get('/marketplace/listings', async (c) => {
        const state = await getUserState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.listings || [] });
    });
    api.post('/marketplace/listings', async (c) => {
        const formData = await c.req.formData();
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const controller = c.var.controller;
        const userId = c.var.userId;
        const state = await getUserState(controller, userId);
        const newListing = { id: Date.now(), name, price: `R ${price}`, category, image: '/ewaste/placeholder.jpg' };
        const updatedListings = [...state.listings, newListing];
        await controller.setState(userId, { ...state, listings: updatedListings });
        return c.json({ success: true, data: newListing });
    });
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
            return c.json({ success: true, data: { name: 'Unknown Item', category: 'E-Waste', estimatedPrice: '0' } });
        }
    });
    // Training
    api.get('/training/progress', async (c) => {
        const state = await getUserState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.trainingProgress || [] });
    });
    api.put('/training/progress/:courseId', async (c) => {
        const courseId = parseInt(c.req.param('courseId'));
        const body = await c.req.json();
        const controller = c.var.controller;
        const userId = c.var.userId;
        const state = await getUserState(controller, userId);
        let updatedCourse;
        const updatedProgress = state.trainingProgress.map((p: any) => {
            if (p.id === courseId) {
                updatedCourse = { ...p, ...body };
                return updatedCourse;
            }
            return p;
        });
        await controller.setState(userId, { ...state, trainingProgress: updatedProgress });
        return c.json({ success: true, data: updatedCourse });
    });
    api.get('/training/leaderboard', async (c) => {
        const state = await getUserState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.leaderboard || [] });
    });
    app.route('/api/v1', api);
}