# Arcium Privacy-as-a-Service Interactive Playground

## Overview

The Arcium Privacy-as-a-Service Interactive Playground is a web-based tool that allows developers to experiment with our privacy APIs directly in their browser. This playground provides:

- Live API testing with real requests
- Code examples in multiple languages
- Visual representation of privacy operations
- Step-by-step tutorials
- Integration guides

## Getting Started

### 1. Access the Playground

The playground is available at: [https://playground.arcium-privacy.com](https://playground.arcium-privacy.com)

### 2. Get an API Key

To use the playground, you'll need an API key:

1. Register at [https://dashboard.arcium-privacy.com](https://dashboard.arcium-privacy.com)
2. Navigate to the "API Keys" section
3. Create a new API key
4. Copy your API key and paste it in the playground

## Features

### Encryption/Decryption

#### Encrypt Text Data

Try encrypting text data using various encryption methods:

1. Enter your text in the input field
2. Select an encryption method (AES-256, RSA, etc.)
3. Enter a password
4. Click "Encrypt"
5. See the encrypted result and copy it

**Example Code:**
```javascript
const ArciumSDK = require('@arcium/privacy-sdk');

const sdk = new ArciumSDK({
  apiKey: 'YOUR_API_KEY'
});

const encrypted = await sdk.encryption.encryptText('Hello, World!', 'my-password');
console.log(encrypted);
```

#### Decrypt Data

Decrypt previously encrypted data:

1. Paste encrypted data into the input field
2. Enter the password used for encryption
3. Click "Decrypt"
4. View the original plaintext

### Zero-Knowledge Proofs

#### Generate Range Proof

Prove that a value is within a specific range without revealing the value:

1. Enter your value (e.g., age: 25)
2. Set the range (e.g., min: 18, max: 100)
3. Click "Generate Proof"
4. See the zero-knowledge proof and verify it

**Example Code:**
```javascript
const proof = await sdk.zkProof.generateRangeProof(25, 18, 100);
const isValid = await sdk.zkProof.verifyProof(proof.data.proof, proof.data.publicSignals, 'range_proof');
console.log(`Proof valid: ${isValid}`);
```

#### Generate Balance Proof

Prove that a balance is above a threshold:

1. Enter your balance (e.g., 1500)
2. Set the minimum threshold (e.g., 1000)
3. Click "Generate Proof"
4. Verify the proof to confirm it's valid

### Selective Disclosure

#### Issue a Verifiable Claim

Create a verifiable claim that can be selectively disclosed:

1. Select claim type (Age, Credit Score, etc.)
2. Enter claim attributes (age: 25, score: 750, etc.)
3. Set disclosure policy (what can be revealed)
4. Click "Issue Claim"
5. See the created claim with its Zero-Knowledge proof

#### Create Disclosure Request

Request specific information from a user:

1. Enter your identifier as the verifier
2. Specify what claims are needed
3. Set disclosure conditions
4. Click "Create Request"
5. Share the request with the user

## Tutorials

### Tutorial 1: Age Verification

This tutorial demonstrates how to implement age verification using zero-knowledge proofs.

**Scenario:** A dApp wants to verify a user is over 18 without knowing their exact age.

**Steps:**
1. Issue an age claim to the user
2. Create a disclosure request asking for age verification
3. User responds with a range proof showing age ≥ 18
4. Verify the proof without learning exact age

```javascript
// 1. Issue an age claim to the user
const claim = await sdk.selectiveDisclosure.issueAgeClaim('user123', 25);

// 2. Create a disclosure request
const request = await sdk.selectiveDisclosure.requestAgeVerification('dapp456', 'user123');

// 3. User generates proof (in their wallet/app)
const rangeProof = await sdk.zkProof.generateRangeProof(25, 18, 100);

// 4. Verify the proof
const isValid = await sdk.zkProof.verifyProof(
  rangeProof.proof,
  rangeProof.publicSignals,
  'range_proof'
);
```

### Tutorial 2: Balance Verification

Verify that a user has sufficient funds without revealing the exact amount.

**Scenario:** A service wants to confirm a user has more than $1000 without knowing the exact balance.

```javascript
// Issue a balance claim
const claim = await sdk.selectiveDisclosure.issueBalanceClaim('user123', 2500);

// User creates balance proof showing amount > 1000
const balanceProof = await sdk.zkProof.generateBalanceGreaterThanProof(2500, 1000);

// Verify the proof
const isValid = await sdk.zkProof.verifyProof(
  balanceProof.proof,
  balanceProof.publicSignals,
  'balance_proof'
);
```

### Tutorial 3: Credit Score Verification

Verify creditworthiness without exposing the exact score.

```javascript
// Issue a credit score claim
const claim = await sdk.selectiveDisclosure.issueCreditScoreClaim('user123', 750);

// Create disclosure request for credit score > 700
const request = await sdk.selectiveDisclosure.requestCreditScoreVerification('lender789', 'user123');

// Generate proof that score > 700
const creditProof = await sdk.zkProof.generateCreditScoreProof(750, 700);
```

## Code Examples

### JavaScript/Node.js

```javascript
const ArciumSDK = require('@arcium/privacy-sdk');

const sdk = new ArciumSDK({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.arcium-privacy.com'
});

// Encrypt data
const encrypted = await sdk.encryption.encryptText('Sensitive data', 'password123');

// Generate ZK proof
const proof = await sdk.zkProof.generateRangeProof(25, 18, 100);

// Issue claim
const claim = await sdk.selectiveDisclosure.issueAgeClaim('user123', 25);

// Check balance
const balance = await sdk.billing.getBalance();
console.log(`Remaining credits: ${balance.data?.balance}`);
```

### Python (using HTTP requests)

```python
import requests
import json

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.arcium-privacy.com/api/v1"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Encrypt data
encrypt_data = {
    "data": "Sensitive data",
    "method": "aes256",
    "password": "password123"
}

response = requests.post(f"{BASE_URL}/encrypt", headers=headers, json=encrypt_data)
encrypted = response.json()
print(encrypted)

# Generate range proof
proof_data = {
    "value": 25,
    "min": 18,
    "max": 100
}

response = requests.post(f"{BASE_URL}/zk-proof/generate-range-proof", headers=headers, json=proof_data)
proof = response.json()
print(proof)
```

### cURL Examples

```bash
# Encrypt data
curl -X POST https://api.arcium-privacy.com/api/v1/encrypt \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": "Hello, World!",
    "method": "aes256",
    "password": "password123"
  }'

# Generate range proof
curl -X POST https://api.arcium-privacy.com/api/v1/zk-proof/generate-range-proof \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 25,
    "min": 18,
    "max": 100
  }'

# Get account balance
curl -X GET https://api.arcium-privacy.com/api/v1/billing/balance/YOUR_API_KEY \
  -H "X-API-Key: YOUR_API_KEY"
```

## Integration Examples

### Web Application Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Arcium Privacy Integration</title>
</head>
<body>
    <div id="encryption-demo">
        <h3>Encryption Demo</h3>
        <input type="text" id="plaintext" placeholder="Enter text to encrypt">
        <input type="password" id="password" placeholder="Enter password">
        <button onclick="encryptData()">Encrypt</button>
        <div id="encrypted-output"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@arcium/privacy-sdk@latest/dist/arcium-sdk.min.js"></script>
    <script>
        const sdk = new ArciumSDK({
            apiKey: 'YOUR_API_KEY'
        });

        async function encryptData() {
            const plaintext = document.getElementById('plaintext').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await sdk.encryption.encryptText(plaintext, password);
                document.getElementById('encrypted-output').innerHTML = 
                    `<p>Encrypted: ${JSON.stringify(result.data)}</p>`;
            } catch (error) {
                console.error('Encryption failed:', error);
            }
        }
    </script>
</body>
</html>
```

## Best Practices

### Security

- Always use strong, unique passwords for encryption
- Store API keys securely and never expose them in client-side code
- Use HTTPS for all API requests
- Implement proper error handling

### Performance

- Cache ZK proof verification results when possible
- Batch multiple operations to reduce API calls
- Monitor your usage to stay within rate limits

### Privacy

- Only request the minimum required information
- Use selective disclosure to limit data exposure
- Implement proper consent mechanisms

## Troubleshooting

### Common Issues

**Q: I'm getting "Invalid API key" errors**
A: Verify your API key is correct and hasn't been revoked in the dashboard.

**Q: ZK proof generation is taking too long**
A: Complex circuits take more time. Consider simpler circuits or pre-generating proofs.

**Q: My balance verification isn't working**
A: Ensure the value is actually greater than the threshold and the proof is generated correctly.

### Getting Help

- Check the [API Reference](./api-reference.md) for detailed endpoint documentation
- Join our [Discord community](https://discord.arcium-privacy.com) for support
- Email our team at [support@arcium-privacy.com](mailto:support@arcium-privacy.com)
- Report issues on [GitHub](https://github.com/arcium/privacy-service/issues)