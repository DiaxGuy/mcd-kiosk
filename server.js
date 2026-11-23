import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check for Coolify / Docker
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'mcdonalds-kiosk'
  });
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
  const { items, orderType, paymentMethod, totalAmount } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  currentOrderNumber = (currentOrderNumber % 99) + 1;
  const orderNumberStr = String(currentOrderNumber).padStart(2, '0');
  const receiptNumber = 'PAR/' + Math.floor(100000 + Math.random() * 900000) + '/' + new Date().getFullYear();

  const newOrder = {
    orderNumber: orderNumberStr,
    receiptNumber,
    orderType: orderType || 'dine_in',
    items,
    totalAmount: Number(totalAmount || 0),
    paymentMethod: paymentMethod || 'card',
    paymentStatus: 'completed',
    kioskId: 'K-04',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  if (orders.length > 200) orders.pop();

  console.log(`[ORDER CREATED] #${orderNumberStr} - ${orderType} - ${totalAmount} PLN via ${paymentMethod}`);
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
  console.log(`===============================================`);
});
