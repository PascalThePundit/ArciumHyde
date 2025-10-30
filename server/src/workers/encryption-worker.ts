// encryption-worker.ts
import { parentPort, workerData } from 'worker_threads';
import * as forge from 'node-forge';

// Simple encryption implementation for the worker thread
const performOperation = (operation: string, ...args: any[]): any => {
  switch (operation) {
    case 'encrypt': {
      const [data, method, publicKey, password] = args;
      return aes256Encrypt(data, password);
    }
    case 'decrypt': {
      const [encryptedData, method, privateKey, password] = args;
      return aes256Decrypt(encryptedData, password);
    }
    case 'deriveKey': {
      const [input, method, salt, iterations] = args;
      return pbkdf2Derive(input, salt, iterations);
    }
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

// AES-256 encryption implementation
const aes256Encrypt = (data: string | Buffer, password?: string): any => {
  if (!password) {
    throw new Error('Password is required for AES encryption');
  }

  // Convert data to string if it's a buffer
  const dataStr = Buffer.isBuffer(data) ? data.toString('utf8') : data;

  // Generate a random salt and initialization vector
  const salt = forge.random.getBytesSync(128 / 8);
  const iv = forge.random.getBytesSync(16);

  // Create a forge cipher
  const derivedKey = forge.pkcs5.pbkdf2(password, salt, 100000, 32);
  const cipher = forge.cipher.createCipher('AES-CBC', derivedKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(dataStr));
  cipher.finish();

  // Return encrypted data along with salt and iv
  return {
    data: forge.util.encode64(cipher.output.getBytes()),
    salt: forge.util.encode64(salt),
    iv: forge.util.encode64(iv),
    method: 'aes256'
  };
};

// AES-256 decryption implementation
const aes256Decrypt = (encryptedData: any, password?: string): string => {
  if (!password) {
    throw new Error('Password is required for AES decryption');
  }

  // Decode the base64 encoded data, salt, and iv
  const decodedData = forge.util.decode64(encryptedData.data);
  const salt = forge.util.decode64(encryptedData.salt);
  const iv = forge.util.decode64(encryptedData.iv);

  // Derive the key using the same salt and parameters
  const derivedKey = forge.pkcs5.pbkdf2(password, salt, 100000, 32);
  
  // Create a forge decipher
  const decipher = forge.cipher.createDecipher('AES-CBC', derivedKey);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(decodedData));
  decipher.finish();

  // Get the decrypted data as a string
  return decipher.output.getBytes();
};

// PBKDF2 key derivation implementation
const pbkdf2Derive = (password: string, salt?: string, iterations: number = 100000): string => {
  const actualSalt = salt || forge.random.getBytesSync(128 / 8);
  const derivedKey = forge.pkcs5.pbkdf2(password, actualSalt, iterations, 32);
  return forge.util.encode64(derivedKey);
};

// Execute the operation and send result back to main thread
if (parentPort && workerData) {
  const { operation, args } = workerData;
  
  try {
    const result = performOperation(operation, ...args);
    parentPort.postMessage(result);
  } catch (error: unknown) {
    const err = error as Error;
    parentPort.postMessage({ error: err.message });
  }
}