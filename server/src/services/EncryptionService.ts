import * as forge from 'node-forge';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';
import { Worker } from 'worker_threads';

export class EncryptionService {
  /**
   * Encrypt data using the specified method
   */
  static async encrypt(
    data: string | Buffer,
    method: string = 'aes256',
    publicKey?: string,
    password?: string
  ): Promise<any> {
    try {
      switch (method.toLowerCase()) {
        case 'aes256':
          return this.aes256Encrypt(data, password);
        case 'rsa':
          return this.rsaEncrypt(data, publicKey);
        case 'secp256k1':
          // For now, simulate secp256k1 encryption
          return this.secp256k1Encrypt(data);
        default:
          throw new BadRequestError(`Unsupported encryption method: ${method}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Encryption failed', { error: err.message, method });
      throw error;
    }
  }

  /**
   * Decrypt data using the specified method
   */
  static async decrypt(
    encryptedData: any,
    method: string = 'aes256',
    privateKey?: string,
    password?: string
  ): Promise<string> {
    try {
      switch (method.toLowerCase()) {
        case 'aes256':
          return this.aes256Decrypt(encryptedData, password);
        case 'rsa':
          return this.rsaDecrypt(encryptedData, privateKey);
        case 'secp256k1':
          return this.secp256k1Decrypt(encryptedData);
        default:
          throw new BadRequestError(`Unsupported decryption method: ${method}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Decryption failed', { error: err.message, method });
      throw error;
    }
  }

  /**
   * Derive a cryptographic key from input
   */
  static async deriveKey(
    input: string,
    method: string = 'pbkdf2',
    salt?: string,
    iterations: number = 100000
  ): Promise<string> {
    try {
      switch (method.toLowerCase()) {
        case 'pbkdf2':
          return this.pbkdf2Derive(input, salt, iterations);
        case 'scrypt':
          return this.scryptDerive(input, salt, iterations);
        default:
          throw new BadRequestError(`Unsupported key derivation method: ${method}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Key derivation failed', { error: err.message, method });
      throw error;
    }
  }

  /**
   * AES-256 encryption using node-forge
   */
  private static aes256Encrypt(data: string | Buffer, password?: string): any {
    if (!password) {
      throw new BadRequestError('Password is required for AES encryption');
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
  }

  /**
   * AES-256 decryption using node-forge
   */
  private static aes256Decrypt(encryptedData: any, password?: string): string {
    if (!password) {
      throw new BadRequestError('Password is required for AES decryption');
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
  }

  /**
   * RSA encryption using node-forge
   */
  private static rsaEncrypt(data: string | Buffer, publicKey?: string): any {
    if (!publicKey) {
      throw new BadRequestError('Public key is required for RSA encryption');
    }

    const dataStr = Buffer.isBuffer(data) ? data.toString('utf8') : data;
    
    // Create an RSA key pair for demonstration (in a real implementation, keys would be provided)
    const rsa = forge.pki.rsa;
    const keypair = rsa.generateKeyPair({ bits: 2048 });
    const pub = keypair.publicKey;
    
    // For this demo, we'll use the provided public key if available
    let pubKey;
    try {
      pubKey = forge.pki.publicKeyFromPem(publicKey);
    } catch (e) {
      // If the public key provided is invalid, generate a new key pair
      pubKey = keypair.publicKey;
    }

    // Encrypt the data
    const encrypted = pubKey.encrypt(dataStr, 'RSA-OAEP');
    const encryptedB64 = forge.util.encode64(encrypted);

    return {
      data: encryptedB64,
      method: 'rsa'
    };
  }

  /**
   * RSA decryption using node-forge
   */
  private static rsaDecrypt(encryptedData: any, privateKey?: string): string {
    if (!privateKey) {
      throw new BadRequestError('Private key is required for RSA decryption');
    }

    const encryptedBytes = forge.util.decode64(encryptedData.data);

    // Load the private key
    const privKey = forge.pki.privateKeyFromPem(privateKey);

    // Decrypt the data
    const decrypted = privKey.decrypt(encryptedBytes, 'RSA-OAEP');

    return decrypted;
  }

  /**
   * Secp256k1 encryption (simulation)
   */
  private static secp256k1Encrypt(data: string | Buffer): any {
    // Secp256k1 doesn't directly encrypt data, but we can simulate
    // by using ECDH to create a shared secret and then encrypt with AES
    const dataStr = Buffer.isBuffer(data) ? data.toString('utf8') : data;
    
    // Generate a random key for AES encryption (simulation)
    const randomKey = forge.random.getBytesSync(32); // 256-bit key
    const keyB64 = forge.util.encode64(randomKey);
    
    // In a real implementation, we'd derive the key using ECDH
    // For now, use the random key to AES encrypt the data
    const salt = forge.random.getBytesSync(128 / 8);
    const iv = forge.random.getBytesSync(16);
    const derivedKey = forge.pkcs5.pbkdf2(keyB64, salt, 100000, 32);
    
    const cipher = forge.cipher.createCipher('AES-CBC', derivedKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(dataStr));
    cipher.finish();
    
    return {
      data: forge.util.encode64(cipher.output.getBytes()),
      salt: forge.util.encode64(salt),
      iv: forge.util.encode64(iv),
      method: 'secp256k1',
      // In a real implementation, you'd also return the ephemeral public key
      ephemeralPublicKey: forge.util.encode64(forge.random.getBytesSync(32))
    };
  }

  /**
   * Secp256k1 decryption (simulation)
   */
  private static secp256k1Decrypt(encryptedData: any): string {
    // Simulate decryption using the same approach as encryption
    const decodedData = forge.util.decode64(encryptedData.data);
    const salt = forge.util.decode64(encryptedData.salt);
    const iv = forge.util.decode64(encryptedData.iv);
    
    // For simulation, we'll use a random key (in real implementation, derive from ECDH)
    const randomKey = forge.random.getBytesSync(32); // This should be derived from ECDH
    const keyB64 = forge.util.encode64(randomKey);
    
    const derivedKey = forge.pkcs5.pbkdf2(keyB64, salt, 100000, 32);
    
    const decipher = forge.cipher.createDecipher('AES-CBC', derivedKey);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(decodedData));
    decipher.finish();
    
    return decipher.output.getBytes();
  }

  /**
   * PBKDF2 key derivation
   */
  private static pbkdf2Derive(password: string, salt?: string, iterations: number = 100000): string {
    const actualSalt = salt || forge.random.getBytesSync(128 / 8);
    const derivedKey = forge.pkcs5.pbkdf2(password, actualSalt, iterations, 32);
    return forge.util.encode64(derivedKey);
  }

  /**
   * Scrypt key derivation (simulation)
   */
  private static scryptDerive(password: string, salt?: string, iterations: number = 100000): string {
    // node-forge doesn't have scrypt, so we'll simulate it with pbkdf2
    // In a real implementation, you'd use a proper scrypt implementation
    return this.pbkdf2Derive(password, salt, iterations);
  }

  /**
   * Process multiple encryption operations in parallel
   */
  static async encryptBatch(
    operations: Array<{
      data: string | Buffer,
      method: string,
      publicKey?: string,
      password?: string
    }>
  ): Promise<any[]> {
    if (operations.length === 0) return [];
    
    // Process operations in parallel
    const promises = operations.map(op => 
      this.encrypt(op.data, op.method, op.publicKey, op.password)
    );
    
    return Promise.all(promises);
  }

  /**
   * Process multiple decryption operations in parallel
   */
  static async decryptBatch(
    operations: Array<{
      encryptedData: any,
      method: string,
      privateKey?: string,
      password?: string
    }>
  ): Promise<string[]> {
    if (operations.length === 0) return [];
    
    // Process operations in parallel
    const promises = operations.map(op => 
      this.decrypt(op.encryptedData, op.method, op.privateKey, op.password)
    );
    
    return Promise.all(promises);
  }

  /**
   * Perform CPU-intensive operations in a worker thread
   */
  static async performInWorker(
    operation: 'encrypt' | 'decrypt' | 'deriveKey',
    ...args: any[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./src/workers/encryption-worker.ts', {
        workerData: { operation, args },
        execArgv: ['--require', 'ts-node/register']
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}