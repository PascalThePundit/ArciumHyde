# Arcium Privacy-as-a-Service API Reference

## Overview

The Arcium Privacy-as-a-Service API provides external developers with access to advanced privacy features including encryption, zero-knowledge proofs, and selective disclosure. This API enables dApps to integrate privacy features without needing to understand the underlying cryptographic complexities.

## Authentication

All API requests require an API key in the `X-API-Key` header:

```
X-API-Key: your_api_key_here
```

## Base URL

- Production: `https://api.arcium-privacy.com/api/v1`
- Sandbox: `https://sandbox.arcium-privacy.com/api/v1`

## Encryption/Decryption Endpoints

### Encrypt Data
**POST** `/encrypt`

Encrypt data using various encryption methods.

**Request Body:**
```json
{
  "data": "string or base64 encoded data",
  "method": "aes256|rsa|secp256k1",
  "publicKey": "public key for RSA encryption (optional)",
  "password": "password for AES encryption (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "encryptedData": {
    "data": "encrypted data string",
    "salt": "salt for AES (if applicable)",
    "iv": "initialization vector (if applicable)",
    "method": "encryption method used"
  },
  "method": "encryption method used",
  "timestamp": "ISO 8601 timestamp"
}
```

### Decrypt Data
**POST** `/decrypt`

Decrypt data using the specified method.

**Request Body:**
```json
{
  "encryptedData": {
    "data": "encrypted data string",
    "salt": "salt for AES (if applicable)",
    "iv": "initialization vector (if applicable)",
    "method": "encryption method used"
  },
  "method": "aes256|rsa|secp256k1",
  "privateKey": "private key for RSA decryption (optional)",
  "password": "password for AES decryption (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "decryptedData": "decrypted string",
  "method": "encryption method used",
  "timestamp": "ISO 8601 timestamp"
}
```

### Derive Key from Password
**POST** `/derive-key`

Derive a cryptographic key from a password using various methods.

**Request Body:**
```json
{
  "input": "password or input string",
  "method": "pbkdf2|scrypt",
  "salt": "salt string (optional)",
  "iterations": 100000
}
```

**Response:**
```json
{
  "success": true,
  "key": "derived key string",
  "method": "key derivation method used",
  "timestamp": "ISO 8601 timestamp"
}
```

## Zero-Knowledge Proof Endpoints

### Generate ZK Proof
**POST** `/zk-proof/generate`

Generate a zero-knowledge proof for a given circuit and inputs.

**Request Body:**
```json
{
  "circuitName": "range_proof|balance_proof|custom_circuit",
  "inputs": {
    "value": "input value",
    "min": "minimum value (for range proofs)",
    "max": "maximum value (for range proofs)",
    "threshold": "threshold value (for comparison proofs)",
    "balance": "balance value (for balance proofs)",
    "secret": "secret value (for ownership proofs)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "proof": {
    "pi_a": ["array", "of", "values"],
    "pi_b": [["nested", "array"], ["of", "values"]],
    "pi_c": ["array", "of", "values"],
    "protocol": "proof protocol",
    "curve": "elliptic curve used"
  },
  "publicSignals": ["array", "of", "public", "signals"],
  "circuitName": "circuit name",
  "timestamp": "ISO 8601 timestamp"
}
```

### Verify ZK Proof
**POST** `/zk-proof/verify`

Verify a zero-knowledge proof.

**Request Body:**
```json
{
  "proof": {
    "pi_a": ["array", "of", "values"],
    "pi_b": [["nested", "array"], ["of", "values"]],
    "pi_c": ["array", "of", "values"],
    "protocol": "proof protocol",
    "curve": "elliptic curve used"
  },
  "publicSignals": ["array", "of", "public", "signals"],
  "circuitName": "range_proof|balance_proof|custom_circuit"
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "circuitName": "circuit name",
  "timestamp": "ISO 8601 timestamp"
}
```

### Generate Range Proof
**POST** `/zk-proof/generate-range-proof`

Generate a proof that a value is within a specific range.

**Request Body:**
```json
{
  "value": 25,
  "min": 18,
  "max": 100
}
```

**Response:**
```json
{
  "success": true,
  "proof": {
    "pi_a": ["array", "of", "values"],
    "pi_b": [["nested", "array"], ["of", "values"]],
    "pi_c": ["array", "of", "values"],
    "protocol": "proof protocol",
    "curve": "elliptic curve used"
  },
  "type": "range_proof",
  "range": [18, 100],
  "timestamp": "ISO 8601 timestamp"
}
```

### Generate Balance Greater Than Proof
**POST** `/zk-proof/generate-balance-proof`

Generate a proof that a balance is greater than a threshold.

**Request Body:**
```json
{
  "balance": 1500,
  "threshold": 1000
}
```

**Response:**
```json
{
  "success": true,
  "proof": {
    "pi_a": ["array", "of", "values"],
    "pi_b": [["nested", "array"], ["of", "values"]],
    "pi_c": ["array", "of", "values"],
    "protocol": "proof protocol",
    "curve": "elliptic curve used"
  },
  "type": "balance_greater_than_proof",
  "threshold": 1000,
  "timestamp": "ISO 8601 timestamp"
}
```

## Selective Disclosure Endpoints

### Issue Claim
**POST** `/selective-disclosure/issue-claim`

Issue a new verifiable claim.

**Request Body:**
```json
{
  "type": "age_range|credit_score|account_balance|identity|custom",
  "issuer": "issuer identifier",
  "subject": "subject identifier",
  "attributes": {
    "age": 25,
    "score": 750,
    "balance": 5000,
    "name": "John Doe"
  },
  "disclosurePolicy": {
    "public": ["name"],
    "conditional": [
      {
        "attribute": "age",
        "condition": "age >= 18",
        "requiredBy": ["verifier1", "verifier2"]
      }
    ],
    "private": ["age", "score", "balance"]
  },
  "expirationDate": 1700000000000
}
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": "claim identifier",
    "type": "claim type",
    "issuer": "issuer identifier",
    "subject": "subject identifier",
    "issuanceDate": 1697000000000,
    "expirationDate": 1700000000000,
    "attributes": {
      "age": 25,
      "score": 750,
      "balance": 5000,
      "name": "John Doe"
    },
    "proof": "zk proof as JSON string",
    "disclosurePolicy": {
      "public": ["name"],
      "conditional": [
        {
          "attribute": "age",
          "condition": "age >= 18",
          "requiredBy": ["verifier1", "verifier2"]
        }
      ],
      "private": ["age", "score", "balance"]
    }
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Create Disclosure Request
**POST** `/selective-disclosure/create-request`

Create a selective disclosure request.

**Request Body:**
```json
{
  "verifier": "verifier identifier",
  "requestedClaims": [
    {
      "type": "age_range",
      "requiredAttributes": ["age"],
      "conditions": {
        "age": "age >= 18"
      }
    }
  ],
  "justification": "Age verification required for service access",
  "expiresInSeconds": 3600
}
```

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "request identifier",
    "verifier": "verifier identifier",
    "requestedClaims": [
      {
        "type": "age_range",
        "requiredAttributes": ["age"],
        "conditions": {
          "age": "age >= 18"
        }
      }
    ],
    "justification": "Age verification required for service access",
    "requestedAt": 1697000000000,
    "expiresAt": 1697003600000
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Respond to Disclosure Request
**POST** `/selective-disclosure/respond`

Respond to a selective disclosure request.

**Request Body:**
```json
{
  "request": {
    "id": "request identifier",
    "verifier": "verifier identifier",
    "requestedClaims": [
      {
        "type": "age_range",
        "requiredAttributes": ["age"],
        "conditions": {
          "age": "age >= 18"
        }
      }
    ],
    "justification": "Age verification required for service access",
    "requestedAt": 1697000000000,
    "expiresAt": 1697003600000
  },
  "holder": "holder identifier",
  "claims": [
    {
      "id": "claim identifier",
      "type": "age_range",
      "issuer": "issuer identifier",
      "subject": "holder identifier",
      "issuanceDate": 1697000000000,
      "expirationDate": 1700000000000,
      "attributes": {
        "age": 25
      },
      "proof": "zk proof as JSON string",
      "disclosurePolicy": {
        "public": [],
        "conditional": [
          {
            "attribute": "age",
            "condition": "age >= 18",
            "requiredBy": ["verifier"]
          }
        ],
        "private": ["age"]
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "requestId": "request identifier",
    "holder": "holder identifier",
    "disclosedClaims": [
      {
        "claimId": "claim identifier",
        "type": "age_range",
        "disclosedAttributes": {
          "age": 25
        },
        "proof": "zk proof as JSON string",
        "timestamp": 1697000000000
      }
    ],
    "signature": "signature string",
    "status": "verified"
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Verify Disclosure Response
**POST** `/selective-disclosure/verify`

Verify a selective disclosure response.

**Request Body:**
```json
{
  "response": {
    "requestId": "request identifier",
    "holder": "holder identifier",
    "disclosedClaims": [
      {
        "claimId": "claim identifier",
        "type": "age_range",
        "disclosedAttributes": {
          "age": 25
        },
        "proof": "zk proof as JSON string",
        "timestamp": 1697000000000
      }
    ],
    "signature": "signature string",
    "status": "verified"
  },
  "request": {
    "id": "request identifier",
    "verifier": "verifier identifier",
    "requestedClaims": [
      {
        "type": "age_range",
        "requiredAttributes": ["age"],
        "conditions": {
          "age": "age >= 18"
        }
      }
    ],
    "justification": "Age verification required for service access",
    "requestedAt": 1697000000000,
    "expiresAt": 1697003600000
  }
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "timestamp": "ISO 8601 timestamp"
}
```

## Privacy Service Registry Endpoints

### List Services
**GET** `/registry/services`

Get list of available privacy services.

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": "service identifier",
      "name": "Service Name",
      "description": "Service description",
      "endpoint": "API endpoint",
      "authRequired": true,
      "tags": ["tag1", "tag2"],
      "schema": {},
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "count": 3,
  "timestamp": "ISO 8601 timestamp"
}
```

### List Plugins
**GET** `/registry/plugins`

Get list of available privacy plugins.

**Response:**
```json
{
  "success": true,
  "plugins": [
    {
      "id": "plugin identifier",
      "name": "Plugin Name",
      "description": "Plugin description",
      "version": "1.0.0",
      "author": "Author Name",
      "enabled": true,
      "config": {},
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "count": 2,
  "timestamp": "ISO 8601 timestamp"
}
```

### Register Service
**POST** `/registry/register-service`

Register a new privacy service.

**Request Body:**
```json
{
  "name": "Service Name",
  "description": "Service description",
  "endpoint": "API endpoint",
  "authRequired": true,
  "tags": ["tag1", "tag2"],
  "schema": {}
}
```

**Response:**
```json
{
  "success": true,
  "service": {
    "id": "service identifier",
    "name": "Service Name",
    "description": "Service description",
    "endpoint": "API endpoint",
    "authRequired": true,
    "tags": ["tag1", "tag2"],
    "schema": {},
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "message": "Service registered successfully",
  "timestamp": "ISO 8601 timestamp"
}
```

## Billing/Usage Endpoints

### Get Usage
**GET** `/billing/usage/{apiKey}`

Get usage statistics for an API key.

**Response:**
```json
{
  "success": true,
  "usage": {
    "userId": "user identifier",
    "apiKey": "API key",
    "totalOperations": 125,
    "totalCost": 250,
    "usageByService": {
      "encryption": {
        "count": 50,
        "totalCost": 50
      },
      "zk-proof": {
        "count": 75,
        "totalCost": 200
      }
    },
    "records": [
      {
        "id": "usage record id",
        "serviceType": "zk-proof",
        "operation": "generate-proof",
        "cost": 5,
        "timestamp": "ISO 8601 timestamp"
      }
    ]
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Get Balance
**GET** `/billing/balance/{apiKey}`

Get account balance for an API key.

**Response:**
```json
{
  "success": true,
  "balance": 750,
  "apiKey": "API key",
  "timestamp": "ISO 8601 timestamp"
}
```

### Charge Account
**POST** `/billing/charge/{apiKey}`

Charge an account for API usage.

**Request Body:**
```json
{
  "amount": 10,
  "serviceType": "zk-proof",
  "operation": "generate-proof"
}
```

**Response:**
```json
{
  "success": true,
  "chargedAmount": 10,
  "remainingBalance": 740,
  "description": "Charged for zk-proof/generate-proof",
  "timestamp": "ISO 8601 timestamp"
}
```

## Analytics Endpoints

### Get Usage Stats
**GET** `/analytics/usage`

Get overall usage statistics (admin access required).

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRequests": 12540,
    "requestsByService": {
      "encryption": 3200,
      "zk-proof": 5100,
      "selective-disclosure": 2800,
      "other": 1440
    },
    "totalRevenue": 2450.75,
    "activeUsers": 245,
    "newUsersToday": 8,
    "usageByHour": {
      "0": 45,
      "1": 32,
      "2": 28,
      // ... more hourly data
    },
    "topServices": [
      { "service": "zk-proof", "count": 5100 },
      { "service": "encryption", "count": 3200 },
      { "service": "selective-disclosure", "count": 2800 }
    ]
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Get User Usage
**GET** `/analytics/usage/{apiKey}`

Get usage statistics for a specific user.

**Response:**
```json
{
  "success": true,
  "usage": {
    "totalOperations": 125,
    "operationsByService": {
      "encryption": 50,
      "zk-proof": 75
    },
    "totalCost": 250,
    "lastActive": "ISO 8601 timestamp",
    "requestsByHour": {
      "8": 5,
      "9": 12,
      "10": 18,
      // ... more hourly data
    }
  },
  "timestamp": "ISO 8601 timestamp"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO 8601 timestamp"
}
```

## Rate Limits

Requests are rate-limited to 100 per 15 minutes per IP address. Exceeding this limit will result in a 429 (Too Many Requests) response:

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later.",
  "timestamp": "ISO 8601 timestamp"
}
```

## HTTP Status Codes

- `200`: Success
- `400`: Bad Request - Request body is malformed or missing required fields
- `401`: Unauthorized - Invalid or missing API key
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Requested resource does not exist
- `422`: Unprocessable Entity - Request validation failed
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Something went wrong on our end