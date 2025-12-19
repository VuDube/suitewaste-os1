import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController } from "./core-utils";
import OpenAI from "openai";
type AppContext = {
    Variables: {
        userId: string;
        role: string;
        userName: string;
        controller: any;
    };
    Bindings: Env & { JWT_SECRET: string };
};
const DEFAULT_JWT_SECRET = "suitewaste-secret-123456";
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
        { id: 1, name: 'Refurbished Laptops (x10)', price: 'R 15,000', category: 'E-Waste', image: 'https://images.unsplash.com/photo-1517336712462-83603c1f1667?auto=format&fit=crop&q=80&w=800' },
        { id: 2, name: 'Scrap Metal Bundle', price: 'R 5,000', category: 'Metals', image: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=800' },
    ],
    trainingProgress: [
        { id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true, started: true, score: 1.0, quiz: [{ question: 'What is PPE?', options: ['Personal Protective Equipment', 'Public Power Entry'], correctAnswer: 'Personal Protective Equipment' }], badge: { name: 'Safety Star', color: 'text-blue-500' } },
        { id: 2, title: 'e-Waste Sorting', duration: '1 hour', completed: false, started: false, score: 0, quiz: [{ question: 'Is lead harmful?', options: ['Yes', 'No'], correctAnswer: 'Yes' }], badge: { name: 'e-Waste Expert', color: 'text-green-500' } },
    ],
    leaderboard: [
        { rank: 1, name: 'John Doe', points: 1500, avatar: 'https://i.pravatar.cc/150?u=1' },
        { rank: 2, name: 'Jane Smith', points: 1350, avatar: 'https://i.pravatar.cc/150?u=2' },
        { rank: 3, name: 'You', points: 1200, avatar: 'https://i.pravatar.cc/150?u=3' },
    ]
};
async function getOrCreateState(controller: any, userId: string) {
    let state = await controller.getState(userId);
    if (!state || Object.keys(state).length === 0) {
        await controller.setState(userId, initialUserData);
        state = initialUserData;
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
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const api = new Hono<AppContext>();
    // Public Login Endpoint
    api.post('/auth/login', async (c) => {
        const { pin } = await c.req.json<{ pin: string }>();
        let user = { id: 'u1', name: 'Default User', role: 'Operator' };
        if (pin === '1234') user = { id: 'op1', name: 'Jacob Zuma', role: 'Operator' };
        else if (pin === '5678') user = { id: 'mgr1', name: 'Cyril Ramaphosa', role: 'Manager' };
        else return c.json({ success: false, error: 'Invalid PIN' }, 401);
        const payload = {
            sub: user.id,
            name: user.name,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
        };
        const token = await sign(payload, c.env.JWT_SECRET || DEFAULT_JWT_SECRET);
        return c.json({ success: true, data: { token, user } });
    });
    // JWT Protected Routes
    api.use('*', async (c, next) => {
        const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET || DEFAULT_JWT_SECRET });
        return jwtMiddleware(c, next);
    });
    api.use('*', async (c, next) => {
        const payload = c.get('jwtPayload' as any);
        c.set('userId', payload.sub);
        c.set('role', payload.role);
        c.set('userName', payload.name);
        c.set('controller', getAppController(c.env));
        await next();
    });
    // Operations
    api.get('/operations/routes', async (c) => {
        const state = await getOrCreateState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.routes });
    });
    // Compliance
    api.get('/compliance/checklist', async (c) => {
        const state = await getOrCreateState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.checklist });
    });
    api.put('/compliance/checklist', async (c) => {
        const { id, checked } = await c.req.json<{ id: string; checked: boolean }>();
        const state = await getOrCreateState(c.var.controller, c.var.userId);
        const updated = state.checklist.map((item: any) => item.id === id ? { ...item, checked } : item);
        await c.var.controller.setState(c.var.userId, { checklist: updated });
        return c.json({ success: true, data: updated.find((i: any) => i.id === id) });
    });
    // Payments
    api.get('/payments/transactions', async (c) => {
        const state = await getOrCreateState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.transactions });
    });
    // Marketplace
    api.get('/marketplace/listings', async (c) => {
        const state = await getOrCreateState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.listings });
    });
    // Training
    api.get('/training/progress', async (c) => {
        const state = await getOrCreateState(c.var.controller, c.var.userId);
        return c.json({ success: true, data: state.trainingProgress });
    });
    app.route('/api/v1', api);
}