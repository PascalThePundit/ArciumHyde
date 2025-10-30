// Example external dApp that uses Arcium Privacy-as-a-Service API
// This demonstrates how to integrate privacy features into a dApp

const ArciumSDK = require('@arcium/privacy-sdk');
const express = require('express');
const session = require('express-session');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'arcium-privacy-demo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Arcium SDK with demo API key
// In a real implementation, API keys would be managed per user
const arciumSDK = new ArciumSDK({
  apiKey: process.env.ARCIUM_API_KEY || 'demo_api_key',
  baseUrl: process.env.ARCIUM_API_URL || 'http://localhost:8080/api/v1' // Point to our privacy service
});

// Route: Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: Encrypt data
app.post('/api/encrypt', async (req, res) => {
  try {
    const { data, password } = req.body;
    
    if (!data || !password) {
      return res.status(400).json({ error: 'Data and password are required' });
    }
    
    const result = await arciumSDK.encryption.encryptText(data, password);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Encryption failed' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Decrypt data
app.post('/api/decrypt', async (req, res) => {
  try {
    const { encryptedData, password } = req.body;
    
    if (!encryptedData || !password) {
      return res.status(400).json({ error: 'Encrypted data and password are required' });
    }
    
    const result = await arciumSDK.encryption.decrypt(encryptedData, 'aes256', undefined, password);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Decryption failed' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Verify age using ZK proofs
app.post('/api/verify-age', async (req, res) => {
  try {
    const { age, minAge = 18 } = req.body;
    
    if (age === undefined || minAge === undefined) {
      return res.status(400).json({ error: 'Age and minimum age are required' });
    }
    
    // Generate a zero-knowledge proof that age >= minAge
    const zkProof = await arciumSDK.zkProof.generateRangeProof(age, minAge, 120);
    
    if (!zkProof.success) {
      return res.status(400).json({ error: zkProof.error || 'ZK proof generation failed' });
    }
    
    // Verify the proof (in a real implementation, this would be done by the verifier)
    const verification = await arciumSDK.zkProof.verifyProof(
      zkProof.data.proof,
      zkProof.data.publicSignals,
      'range_proof'
    );
    
    res.json({
      success: true,
      proof: zkProof.data,
      verified: verification.success && verification.data === true,
      message: age >= minAge ? 'Age verified successfully' : 'Age verification failed'
    });
  } catch (error) {
    console.error('Age verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Check user balance privacy
app.post('/api/check-balance', async (req, res) => {
  try {
    const { balance, threshold = 1000 } = req.body;
    
    if (balance === undefined || threshold === undefined) {
      return res.status(400).json({ error: 'Balance and threshold are required' });
    }
    
    // Generate a zero-knowledge proof that balance > threshold
    const zkProof = await arciumSDK.zkProof.generateBalanceGreaterThanProof(balance, threshold);
    
    if (!zkProof.success) {
      return res.status(400).json({ error: zkProof.error || 'ZK proof generation failed' });
    }
    
    // Verify the proof
    const verification = await arciumSDK.zkProof.verifyProof(
      zkProof.data.proof,
      zkProof.data.publicSignals,
      'balance_proof'
    );
    
    res.json({
      success: true,
      proof: zkProof.data,
      verified: verification.success && verification.data === true,
      message: balance > threshold ? 'Balance verified as sufficient' : 'Balance verification failed'
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get account usage
app.get('/api/usage', async (req, res) => {
  try {
    const result = await arciumSDK.billing.getUsage();
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to get usage' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Usage fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get account balance
app.get('/api/balance', async (req, res) => {
  try {
    const result = await arciumSDK.billing.getBalance();
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to get balance' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(``);
  console.log(`=======================================================`);
  console.log(`Arcium Privacy Demo dApp Server Running on Port ${PORT}`);
  console.log(``);
  console.log(`Features:`);
  console.log(`- Data Encryption/Decryption`);
  console.log(`- Zero-Knowledge Proof Generation`);
  console.log(`- Age Verification`);
  console.log(`- Balance Privacy Checks`);
  console.log(`- Usage Analytics`);
  console.log(``);
  console.log(`Endpoints:`);
  console.log(`GET  / - Main page`);
  console.log(`POST /api/encrypt - Encrypt data`);
  console.log(`POST /api/decrypt - Decrypt data`);
  console.log(`POST /api/verify-age - Verify age without disclosure`);
  console.log(`POST /api/check-balance - Check balance without disclosure`);
  console.log(`GET  /api/usage - Get API usage`);
  console.log(`GET  /api/balance - Get account balance`);
  console.log(``);
  console.log(`=======================================================`);
  console.log(``);
});