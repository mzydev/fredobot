# Bot API Documentation

This document describes the internal services and how they work together.

## Service Architecture

The bot uses a layered architecture:

```
Bot (bot.js)
    ↓
Message Handler (messageHandler.js)
    ↓
User/Admin Handlers (userHandlers.js, adminHandlers.js)
    ↓
Services (userService.js, configService.js, etc.)
    ↓
Database (database.js) → MySQL
```

## Services

### UserService

Handles user account operations.

#### Methods

##### `getOrCreateUser(telegramId, userData)`
Creates a new user if they don't exist.

```javascript
const user = await userService.getOrCreateUser(123456789, {
  username: 'john_doe',
  first_name: 'John'
});
// Returns: { id: 1 }
```

##### `getUser(telegramId)`
Retrieves user by Telegram ID.

```javascript
const user = await userService.getUser(123456789);
// Returns: { id: 1, telegram_id: 123456789, balance: 50.00, ... }
```

##### `updateBalance(telegramId, amount)`
Adds amount to user's balance (amount can be negative).

```javascript
await userService.updateBalance(123456789, 25.00);
// User balance increased by $25
```

##### `deductBalance(telegramId, amount)`
Deducts amount from balance if sufficient funds exist.

```javascript
const success = await userService.deductBalance(123456789, 4.99);
// Returns: true if successful, false if insufficient balance
```

##### `getAllUsers()`
Returns all users in the system.

```javascript
const users = await userService.getAllUsers();
// Returns: [{ id: 1, ... }, { id: 2, ... }, ...]
```

##### `getTotalUsers()`
Returns count of all users.

```javascript
const count = await userService.getTotalUsers();
// Returns: 42
```

### ConfigService

Manages VPN/proxy configurations.

#### Methods

##### `createConfig(name, configLink, subLink, description)`
Adds a new configuration.

```javascript
const config = await configService.createConfig(
  'US Server',
  'config_link_here',
  'sub_link_here',
  'Fast US server'
);
// Returns: { id: 1 }
```

##### `getAllConfigs(activeOnly)`
Retrieves active configurations.

```javascript
const configs = await configService.getAllConfigs(true);
// Returns: [{ id: 1, name: 'US Server', ... }]
```

##### `updateConfig(configId, updates)`
Updates configuration details.

```javascript
await configService.updateConfig(1, {
  name: 'US Server - Updated',
  description: 'Updated description'
});
```

##### `deleteConfig(configId)`
Marks configuration as inactive.

```javascript
await configService.deleteConfig(1);
```

### PurchaseService

Manages user subscriptions.

#### Methods

##### `createPurchase(userId, configId, planType)`
Creates a new purchase.

```javascript
const purchase = await purchaseService.createPurchase(1, 1, 'bronze');
// Returns: { id: 1, expiryDate: Date }
```

Plan types: `'bronze'`, `'silver'`, `'gold'`

##### `getUserPurchases(userId, activeOnly)`
Gets user's purchases.

```javascript
const purchases = await purchaseService.getUserPurchases(1, true);
// Returns: [{ id: 1, name: 'US Server', plan_type: 'bronze', expiry_date: Date, ... }]
```

##### `getPurchase(purchaseId)`
Retrieves specific purchase with config details.

```javascript
const purchase = await purchaseService.getPurchase(1);
// Returns: { id: 1, config_link: '...', sub_link: '...', ... }
```

##### `getTotalRevenue()`
Calculates revenue from last 30 days.

```javascript
const revenue = await purchaseService.getTotalRevenue();
// Returns: 1299.99
```

### PaymentService

Handles payment requests and approvals.

#### Methods

##### `createPayment(userId, amount, cryptoType)`
Creates pending payment request.

```javascript
const payment = await paymentService.createPayment(1, 25.00, 'BTC');
// Returns: { id: 1 }
```

Supported crypto types: `'BTC'`, `'ETH'`, `'USDT'`, `'USDC'`

##### `getPendingPayments()`
Gets all pending payments (for admin).

```javascript
const payments = await paymentService.getPendingPayments();
// Returns: [{ id: 1, user_id: 1, amount: 25.00, crypto_type: 'BTC', ... }]
```

##### `approvePayment(paymentId, approvedBy)`
Approves payment and credits user's balance.

```javascript
await paymentService.approvePayment(1, 987654321); // admin telegram_id
// Updates payment status to 'approved'
// Credits user balance
```

##### `rejectPayment(paymentId, reason)`
Rejects payment request.

```javascript
await paymentService.rejectPayment(1, 'Invalid transaction ID');
// Updates payment status to 'rejected'
```

##### `getPayment(paymentId)`
Retrieves payment details.

```javascript
const payment = await paymentService.getPayment(1);
// Returns: { id: 1, status: 'pending', ... }
```

## Helper Functions

Located in `src/utils/helpers.js`:

```javascript
// Format currency
formatCurrency(50) // Returns: "$50.00"

// Format dates
formatDate(new Date()) // Returns: "May 25, 2026"
formatDateTime(new Date()) // Returns: "May 25, 2026, 03:30 PM"

// Calculate days until expiry
getDaysUntilExpiry(expiryDate) // Returns: 15 (days)

// Check if user is admin
isAdmin(telegramId, adminIds) // Returns: true/false

// Get plan details
getPlanDetails('bronze') // Returns: { name: '🥉 Bronze', price: 4.99, days: 30 }

// Validate cryptocurrency address
validateCryptoAddress('0x...', 'ETH') // Returns: true/false
```

## Database Queries

### Direct Database Access

For advanced use cases, directly query the database:

```javascript
const { pool } = require('./config/database');

const connection = await pool.getConnection();
const [results] = await connection.query('SELECT * FROM users WHERE balance > ?', [100]);
await connection.release();
```

### Common Queries

```javascript
// Get user with purchase count
SELECT u.*, COUNT(p.id) as purchase_count
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
WHERE u.telegram_id = ?
GROUP BY u.id;

// Get revenue by plan type
SELECT plan_type, COUNT(*) as count, SUM(amount) as revenue
FROM purchases
WHERE purchase_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY plan_type;

// Get top users by spending
SELECT u.id, u.username, COUNT(p.id) as purchases, SUM(payment.amount) as total_spent
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
LEFT JOIN payments payment ON u.id = payment.user_id AND payment.status = 'approved'
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 10;
```

## Event Flows

### Purchase Flow

```
1. User selects plan (/buy → plan selection)
2. User confirms purchase
3. UserService.deductBalance() called
4. PurchaseService.createPurchase() creates record
5. Purchase notification sent to user
6. User can view in /myconfigs
```

### Payment Approval Flow

```
1. User requests balance top-up (/addbalance)
2. User selects crypto type
3. User provides transaction ID
4. PaymentService.createPayment() creates pending record
5. Admin sees payment in /approve_payments
6. Admin reviews and clicks approve/reject button
7. If approved:
   - PaymentService.approvePayment() called
   - UserService.updateBalance() credits account
   - User notified of approval
```

## Error Handling

All service methods include try-catch and console logging:

```javascript
try {
  const user = await userService.getUser(telegramId);
  // ...
} catch (error) {
  console.error('[v0] Error in getUser:', error);
  await ctx.reply('An error occurred. Please try again.');
}
```

## Session Management

User state is stored in Telegraf session:

```javascript
ctx.session.selectedPlan = 'bronze';
ctx.session.cryptoType = 'BTC';
ctx.session.awaitingTxid = true;
ctx.session.broadcastMessage = 'Hello all users';
```

Session data is stored in memory by default. For production, consider Redis-based sessions.

## Rate Limiting

Currently not implemented. For production, add rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

// Apply to handlers
bot.use(limiter);
```

## Database Transactions

For operations requiring atomicity:

```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  // Multiple operations
  await connection.query('UPDATE users SET balance = ?', [newBalance]);
  await connection.query('INSERT INTO payments ...', [...]);
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.release();
}
```

## Performance Considerations

### Connection Pooling
The bot uses MySQL connection pooling with default limit of 10 connections.

### Query Optimization
- Always use WHERE clauses to filter results
- Use LIMIT for pagination
- Index frequently queried columns

### Memory Management
- Session data is automatically cleaned up
- Database connections are pooled and reused
- Large result sets should be paginated

## Adding New Features

To add a new service:

1. Create file in `src/services/newService.js`
2. Implement methods with database calls
3. Add error logging with `[v0]` prefix
4. Export as module
5. Import in handlers or other services
6. Use in appropriate handler

Example:

```javascript
// src/services/referralService.js
class ReferralService {
  async createReferral(userId, referrerId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO referrals (user_id, referrer_id) VALUES (?, ?)',
        [userId, referrerId]
      );
      await connection.release();
      return { id: result.insertId };
    } catch (error) {
      console.error('[v0] Error in createReferral:', error);
      throw error;
    }
  }
}

module.exports = new ReferralService();
```

Then use in handlers:

```javascript
const referralService = require('../services/referralService');

await referralService.createReferral(userId, referrerId);
```
