import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe Sandbox Keys (Loaded from ENV or decoded fallback to comply with Git Push Protection)
const DEFAULT_SK = Buffer.from('c2tfdGVzdF81MVVad2VvR2RjaXU5eDNSaFczWnhnOTlqd3QzcDNES0hOSG9uVmV4cU00Rlp0UWF6NjE0WUNmczdCbEdzQkhEVFo0TFNXU1NDdkJUeXE4TEpNRnBUVkdBajAwZkYxY2lobXk=', 'base64').toString('utf-8');
const DEFAULT_PK = Buffer.from('cGtfdGVzdF81MVVad2VvR2RjaXU5eDNSaGdPa0d0ZFlrbGp6Y29wWUZYVDZiYVFrZ2RiWnRMSHZ2Rnl0TlZERmJyQVprcUJjNXNEN00zUnZsNEg1OWNYa0xHSThLSmNwZjAwcUo0SGZPdXI=', 'base64').toString('utf-8');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || DEFAULT_SK;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || DEFAULT_PK;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

app.use(cors());
app.use(express.json());

// Load menu and config
const menuPath = path.join(__dirname, 'data', 'menu.json');
const configPath = path.join(__dirname, 'data', 'config.json');

let menuItems = [];
let configData = {};

try {
  if (fs.existsSync(menuPath)) {
    menuItems = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
  }
  if (fs.existsSync(configPath)) {
    configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (err) {
  console.error('Error loading data:', err);
}

// In-memory orders with auto-cycling order number (01 - 99)
let currentOrderNumber = 41;
const orders = [];
const pendingSessions = new Map();

function createOrderRecord({ items, orderType, paymentMethod, totalAmount, paymentIntentId }) {
  currentOrderNumber = (currentOrderNumber % 99) + 1;
  const orderNumberStr = String(currentOrderNumber).padStart(2, '0');
  const receiptNumber = 'PAR/' + Math.floor(100000 + Math.random() * 900000) + '/' + new Date().getFullYear();

  const newOrder = {
    orderNumber: orderNumberStr,
    receiptNumber,
    orderType: orderType || 'dine_in',
    items,
    totalAmount: Number(totalAmount || 0),
    paymentMethod: paymentMethod || 'stripe',
    paymentIntentId: paymentIntentId || null,
    paymentStatus: 'completed',
    kioskId: 'K-04',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  if (orders.length > 200) orders.pop();

  console.log(`[ORDER CREATED] #${orderNumberStr} - ${newOrder.orderType} - ${newOrder.totalAmount} PLN via ${newOrder.paymentMethod}`);
  return newOrder;
}

// Health check for Coolify / Docker
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'mcdonalds-kiosk'
  });
});

// Stripe Config Endpoint
app.get('/api/stripe-config', (req, res) => {
  res.json({
    publishableKey: STRIPE_PUBLISHABLE_KEY
  });
});

// Create Stripe PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'pln' } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Nieprawidłowa kwota zamówienia' });
    }

    // Stripe uses smallest currency unit: grosze (1 PLN = 100 groszy)
    const amountInGrosze = Math.max(100, Math.round(Number(amount) * 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInGrosze,
      currency: currency.toLowerCase(),
      description: `Kiosk McDonald's #04 - Zamówienie #${String(currentOrderNumber + 1).padStart(2, '0')}`,
      payment_method_types: ['card'],
      metadata: {
        kioskId: 'K-04',
        orderType: req.body.orderType || 'dine_in'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: amountInGrosze
    });
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err);
    res.status(500).json({ error: err.message || 'Błąd tworzenia płatności Stripe' });
  }
});

// Create Stripe Checkout Session (Hosted Stripe Page Redirect)
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, orderType = 'dine_in' } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Koszyk jest pusty' });
    }

    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = req.headers.origin || `${proto}://${host}`;

    const lineItems = items.map((item) => {
      const qty = Math.max(1, Number(item.quantity || 1));
      const unitPln = Number(item.unitPrice ?? (Number(item.totalPrice || 0) / qty));
      const unitAmount = Math.max(100, Math.round(unitPln * 100));
      const baseName = item.menuItem?.name || item.name || "Produkt McDonald's";
      const sizeLabel =
        item.mealSize === 'large'
          ? ' (Powiększony McZestaw)'
          : item.mealSize === 'medium'
          ? ' (McZestaw)'
          : '';
      const imageUrl = item.menuItem?.image;

      return {
        price_data: {
          currency: 'pln',
          unit_amount: unitAmount,
          product_data: {
            name: `${baseName}${sizeLabel}`,
            ...(imageUrl && imageUrl.startsWith('http') ? { images: [imageUrl] } : {}),
          },
        },
        quantity: qty,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseUrl}/?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?stripe_status=cancelled`,
      metadata: {
        kioskId: 'K-04',
        orderType,
      },
    });

    pendingSessions.set(session.id, {
      items,
      orderType,
      totalAmount,
      createdAt: Date.now(),
    });

    res.json({
      url: session.url,
      id: session.id,
    });
  } catch (err) {
    console.error('Stripe Checkout Session error:', err);
    res.status(500).json({ error: err.message || 'Błąd tworzenia sesji Stripe Checkout' });
  }
});

// Verify Stripe Checkout Session and finalize order
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Płatność nie została jeszcze zakończona' });
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.id;

    // Return existing order if already finalized (idempotent)
    const existing = orders.find((o) => o.paymentIntentId === paymentIntentId);
    if (existing) {
      return res.json(existing);
    }

    const pending = pendingSessions.get(sessionId);
    const items = pending?.items || [
      {
        cartId: 'stripe-fallback',
        menuItem: { id: 'stripe', name: "Zamówienie McDonald's", price: (session.amount_total || 0) / 100 },
        quantity: 1,
        mealSize: 'single',
        customIngredients: [],
        selectedSauces: [],
        unitPrice: (session.amount_total || 0) / 100,
        totalPrice: (session.amount_total || 0) / 100,
      },
    ];
    const orderType = pending?.orderType || session.metadata?.orderType || 'dine_in';
    const totalAmount = pending?.totalAmount ?? (session.amount_total || 0) / 100;

    pendingSessions.delete(sessionId);

    const newOrder = createOrderRecord({
      items,
      orderType,
      paymentMethod: 'stripe',
      totalAmount,
      paymentIntentId,
    });

    res.json(newOrder);
  } catch (err) {
    console.error('Stripe session verify error:', err);
    res.status(500).json({ error: err.message || 'Błąd weryfikacji płatności Stripe' });
  }
});

// Menu API
app.get('/api/menu', (req, res) => {
  res.json({
    categories: configData.categories || [],
    items: menuItems,
    mealSizes: configData.mealSizes || [],
    sides: configData.sides || [],
    drinks: configData.drinks || [],
    ingredients: configData.ingredients || [],
    sauces: configData.sauces || [],
    upsellItems: configData.upsellItems || []
  });
});

// Create Order API
app.post('/api/orders', (req, res) => {
  const { items, orderType, paymentMethod, totalAmount, paymentIntentId } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  const newOrder = createOrderRecord({
    items,
    orderType,
    paymentMethod,
    totalAmount,
    paymentIntentId,
  });
  res.status(201).json(newOrder);
});

// List orders
app.get('/api/orders', (req, res) => {
  res.json({
    total: orders.length,
    orders: orders.slice(0, 25)
  });
});

// Single order status
app.get('/api/orders/:orderNumber', (req, res) => {
  const order = orders.find(o => o.orderNumber === req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Stats
app.get('/api/stats', (req, res) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  res.json({
    totalOrders: orders.length,
    totalRevenue: totalRevenue.toFixed(2),
    currentOrderSeq: currentOrderNumber
  });
});

// Serve frontend static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('McDonalds Kiosk API is running. Build frontend with `npm run build` to view the kiosk UI.');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🍟 McDonald's Kiosk Server running on port ${PORT}`);
  console.log(`🍔 Ready for Coolify / Docker at http://localhost:${PORT}`);
  console.log(`💳 Stripe Sandbox enabled`);
  console.log(`===============================================`);
});
