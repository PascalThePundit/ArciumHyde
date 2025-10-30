import { EncryptOptions, DecryptOptions, EncryptionResult } from '../types';

export class EncryptionService {
  async encrypt(options: EncryptOptions): Promise<EncryptionResult> {
    console.log('Mock EncryptionService: Encrypting data', options.data);
    return { encryptedData: `encrypted(${options.data})` };
  }

  async decrypt(options: DecryptOptions): Promise<string> {
    console.log('Mock EncryptionService: Decrypting data', options.encryptedData);
    return options.encryptedData.replace('encrypted(', '').replace(')', '');
  }
}
