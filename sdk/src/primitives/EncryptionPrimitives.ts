import { PrivacyPrimitive, PrivacyInput, PrivacyOutput, EncryptOptions, DecryptOptions } from '../types'; // Import EncryptOptions, DecryptOptions
import { EncryptionService } from '../services/encryption'; // Changed import path

export class EncryptionPrimitive implements PrivacyPrimitive {
  id = 'encrypt';
  name = 'Encryption Primitive';
  description = 'Encrypts data using various encryption methods';
  category = 'encryption'; // Added
  version = '1.0.0'; // Added
  author = 'Arcium Team'; // Added
  tags = ['encryption', 'aes', 'symmetric']; // Added
  dependencies = []; // Added
  inputs = {};
  outputs = {};

  constructor(private encryptionService: EncryptionService) {}

  async execute(input: PrivacyInput): Promise<PrivacyOutput> {
    const { data, password, method = 'aes256' } = input;
    
    if (!data || !password) {
      throw new Error('Data and password are required for encryption');
    }

    const encryptOptions: EncryptOptions = {
      data: data.toString(),
      key: password,
      method: method,
    };

    const result = await this.encryptionService.encrypt(encryptOptions);
    
    return {
      encryptedData: result.encryptedData, // Access encryptedData from result
      method,
      success: true
    };
  }
}

export class DecryptionPrimitive implements PrivacyPrimitive {
  id = 'decrypt';
  name = 'Decryption Primitive';
  description = 'Decrypts data using various decryption methods';
  category = 'encryption'; // Added
  version = '1.0.0'; // Added
  author = 'Arcium Team'; // Added
  tags = ['decryption', 'aes', 'symmetric']; // Added
  dependencies = []; // Added
  inputs = {};
  outputs = {};

  constructor(private encryptionService: EncryptionService) {}

  async execute(input: PrivacyInput): Promise<PrivacyOutput> {
    const { encryptedData, password, method = 'aes256' } = input;
    
    if (!encryptedData || !password) {
      throw new Error('Encrypted data and password are required for decryption');
    }

    const decryptOptions: DecryptOptions = {
      encryptedData: encryptedData.toString(),
      key: password,
      method: method,
    };

    const result = await this.encryptionService.decrypt(decryptOptions);
    
    return {
      decryptedData: result,
      method,
      success: true
    };
  }
}
