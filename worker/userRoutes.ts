import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController } from "./core-utils";
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
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
        };
        const token = await sign(payload, c.env.JWT_SECRET || DEFAULT_JWT_SECRET);
        return c.json({ success: true, data: { token, user } });
    });
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
        const state = await c.var.controller.getState(c.var.userId);
        return c.json({ success: true, data: state.routes || [] });
    });
    // Compliance
    api.get('/compliance/checklist', async (c) => {
        const state = await c.var.controller.getState(c.var.userId);
        return c.json({ success: true, data: state.checklist || [] });
    });
    api.put('/compliance/checklist', async (c) => {
        const { id, checked } = await c.req.json<{ id: string; checked: boolean }>();
        const item = await c.var.controller.updateChecklistItem(c.var.userId, id, checked);
        return c.json({ success: true, data: item });
    });
    api.post('/compliance/audit', async (c) => {
        const state = await c.var.controller.getState(c.var.userId);
        const unchecked = state.checklist.filter((i: any) => !i.checked);
        const resolvedCount = unchecked.length;
        const updated = state.checklist.map((i: any) => ({ ...i, checked: true }));
        await c.var.controller.setState(c.var.userId, { checklist: updated });
        return c.json({ success: true, data: { resolved: resolvedCount } });
    });
    // Payments
    api.get('/payments/transactions', async (c) => {
        const state = await c.var.controller.getState(c.var.userId);
        return c.json({ success: true, data: state.transactions || [] });
    });
    api.post('/payments/transactions', async (c) => {
        const body = await c.req.json();
        const tx = await c.var.controller.addTransaction(c.var.userId, {
            recipient: body.recipient,
            amount: `R ${body.amount}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Completed'
        });
        return c.json({ success: true, data: tx });
    });
    // Marketplace
    api.get('/marketplace/listings', async (c) => {
        const state = await c.var.controller.getState(c.var.userId);
        return c.json({ success: true, data: state.listings || [] });
    });
    api.post('/marketplace/classify', async (c) => {
        // Simulated AI vision classification
        return c.json({
            success: true,
            data: {
                name: "Categorized e-Waste Item",
                category: "E-Waste",
                estimatedPrice: "R 450.00"
            }
        });
    });
    api.post('/marketplace/listings', async (c) => {
        const formData = await c.req.formData();
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const image = formData.get('image') as string;
        const listing = await c.var.controller.addListing(c.var.userId, {
            name,
            price: `R ${price}`,
            category,
            image: image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800'
        });
        return c.json({ success: true, data: listing });
    });
    // Training
    api.get('/training/progress', async (c) => {
        const state = await c.var.controller.getState(c.var.userId);
        return c.json({ success: true, data: state.trainingProgress || [] });
    });
    api.put('/training/progress/:id', async (c) => {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();
        const updated = await c.var.controller.updateTrainingProgress(c.var.userId, id, body);
        return c.json({ success: true, data: updated });
    });
    api.get('/training/leaderboard', async (c) => {
        const state = await c.var.controller.getState(c.var.userId);
        return c.json({ success: true, data: state.leaderboard || [] });
    });
    app.route('/api/v1', api);
}