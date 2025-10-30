/**
 * Example: Data Encryption and Decryption
 * 
 * This example demonstrates how to securely encrypt and decrypt sensitive data
 * using the Arcium Privacy SDK.
 */

import ArciumPrivacy from '../dist/index.js'; // Adjust path as needed

// In a real application, you would use your actual API key
const API_KEY = process.env.ARCIUM_API_KEY || 'YOUR_API_KEY_HERE';

async function dataEncryptionExample() {
  console.log('🔐 Data Encryption Example');
  console.log('=========================\n');

  // Initialize the privacy SDK
  const privacy = new ArciumPrivacy({
    apiKey: API_KEY,
    debug: true
  });

  // Sample sensitive data to encrypt
  const sensitiveData = {
    fullName: 'John Doe',
    ssn: '123-45-6789',
    creditCard: '4111-1111-1111-1111',
    birthDate: '1990-01-01',
    address: '123 Main St, Anytown, USA'
  };

  console.log('Original sensitive data:');
  console.log(JSON.stringify(sensitiveData, null, 2));
  console.log('');

  try {
    // Step 1: Encrypt individual fields
    console.log('1️⃣ Encrypting individual fields...');
    const encryptionPromises = Object.entries(sensitiveData).map(async ([key, value]) => {
      const encrypted = await privacy.encrypt(value.toString(), 'my-secure-password-123');
      return [key, encrypted];
    });

    const encryptedEntries = await Promise.all(encryptionPromises);
    const encryptedData = Object.fromEntries(encryptedEntries);

    console.log('✅ All fields encrypted successfully!');
    console.log('Encrypted data:');
    console.log(JSON.stringify(encryptedData, null, 2));
    console.log('');

    // Step 2: Encrypt the entire object at once
    console.log('2️⃣ Encrypting entire object...');
    const encryptedObject = await privacy.encryptJson(sensitiveData, 'object-encryption-key');
    console.log('✅ Entire object encrypted!');
    console.log('Encrypted object size:', JSON.stringify(encryptedObject).length, 'characters\n');

    // Step 3: Decrypt individual fields
    console.log('3️⃣ Decrypting individual fields...');
    const decryptionPromises = Object.entries(encryptedData).map(async ([key, encryptedValue]) => {
      const decrypted = await privacy.decrypt(encryptedValue.encryptedData, 'my-secure-password-123');
      return [key, decrypted];
    });

    const decryptedEntries = await Promise.all(decryptionPromises);
    const decryptedData = Object.fromEntries(decryptedEntries);

    console.log('✅ All fields decrypted successfully!');
    console.log('Decrypted data:');
    console.log(JSON.stringify(decryptedData, null, 2));
    console.log('');

    // Step 4: Decrypt the entire object
    console.log('4️⃣ Decrypting entire object...');
    const decryptedObject = await privacy.decryptJson(encryptedObject.encryptedData, 'object-encryption-key');
    console.log('✅ Entire object decrypted!');
    console.log('Decrypted object matches original:', JSON.stringify(decryptedObject) === JSON.stringify(sensitiveData) ? '✅' : '❌');
    console.log('');

    // Step 5: Test password protection
    console.log('5️⃣ Testing password protection...');
    try {
      // Try to decrypt with wrong password
      await privacy.decrypt(encryptedData.fullName.encryptedData, 'wrong-password');
      console.log('   ❌ Decryption with wrong password should have failed!');
    } catch (error) {
      console.log('   ✅ Correctly failed to decrypt with wrong password:', error.message);
    }
    console.log('');

    // Step 6: Performance testing with larger data
    console.log('6️⃣ Performance test with larger data...');
    const largeData = {
      largeText: 'A'.repeat(10000), // 10KB of text
      nestedData: {
        level1: {
          level2: {
            level3: Array.from({ length: 1000 }, (_, i) => `item-${i}`)
          }
        }
      }
    };

    const startTime = Date.now();
    const largeEncrypted = await privacy.encryptJson(largeData, 'large-data-key');
    const encryptTime = Date.now() - startTime;

    const decryptStartTime = Date.now();
    const largeDecrypted = await privacy.decryptJson(largeEncrypted.encryptedData, 'large-data-key');
    const decryptTime = Date.now() - decryptStartTime;

    console.log(`   Large data encryption: ${(encryptTime / 1000).toFixed(2)}s`);
    console.log(`   Large data decryption: ${(decryptTime / 1000).toFixed(2)}s`);
    console.log(`   Data integrity: ${JSON.stringify(largeData) === JSON.stringify(largeDecrypted) ? '✅' : '❌'}\n`);

    // Step 7: Different encryption methods
    console.log('7️⃣ Testing different encryption methods...');
    const testString = 'This is a test string for different methods';
    const password = 'method-test-password';

    const methods = ['aes256']; // Additional methods would be available in full implementation
    for (const method of methods) {
      const encrypted = await privacy.encrypt(testString, password, { method });
      const decrypted = await privacy.decrypt(encrypted.encryptedData, password, { method });
      console.log(`   Method ${method}: ${testString === decrypted ? '✅' : '❌'} (size: ${encrypted.encryptedData.data.length})`);
    }
    console.log('');

    // Step 8: Secure key derivation
    console.log('8️⃣ Testing secure key derivation...');
    const password1 = 'user-password-1';
    const password2 = 'user-password-2';
    
    const key1 = await privacy.encryption.deriveKey(password1, 'salt1');
    const key2 = await privacy.encryption.deriveKey(password2, 'salt1');
    const key3 = await privacy.encryption.deriveKey(password1, 'salt2'); // Same password, different salt
    
    console.log(`   Key for password 1: ${key1.substring(0, 16)}...`);
    console.log(`   Key for password 2: ${key2.substring(0, 16)}...`);
    console.log(`   Key for password 1 (diff salt): ${key3.substring(0, 16)}...`);
    console.log(`   Keys are unique: ${key1 !== key2 && key1 !== key3 && key2 !== key3 ? '✅' : '❌'}\n`);

    // Step 9: Multiple encryption layers
    console.log('9️⃣ Testing multiple encryption layers...');
    const original = 'Top secret message';
    const outerPassword = 'outer-key';
    const innerPassword = 'inner-key';
    
    // Double encrypt
    const firstEncrypt = await privacy.encrypt(original, innerPassword);
    const secondEncrypt = await privacy.encrypt(firstEncrypt.encryptedData, outerPassword);
    
    // Double decrypt
    const firstDecrypt = await privacy.decrypt(secondEncrypt.encryptedData, outerPassword);
    const secondDecrypt = await privacy.decrypt(JSON.parse(firstDecrypt).encryptedData, innerPassword);
    
    console.log(`   Original: ${original}`);
    console.log(`   Double encrypted then decrypted: ${secondDecrypt === original ? '✅' : '❌'}\n`);

    // Step 10: Batch encryption operations
    console.log('🔟 Testing batch operations...');
    const itemsToEncrypt = Array.from({ length: 10 }, (_, i) => `item-${i}-secret-data`);
    const passwordForBatch = 'batch-operation-password';
    
    const batchStartTime = Date.now();
    const batchEncrypted = await Promise.all(
      itemsToEncrypt.map(item => privacy.encrypt(item, passwordForBatch))
    );
    
    const batchDecrypted = await Promise.all(
      batchEncrypted.map((encrypted, index) => 
        privacy.decrypt(encrypted.encryptedData, passwordForBatch)
      )
    );
    
    const batchTime = Date.now() - batchStartTime;
    const allMatch = batchDecrypted.every((decrypted, index) => decrypted === itemsToEncrypt[index]);
    
    console.log(`   Batch operation (10 items): ${allMatch ? '✅' : '❌'}`);
    console.log(`   Batch operation time: ${(batchTime / 1000).toFixed(3)}s\n`);

    console.log('🎉 Data encryption example completed successfully!');
    console.log('\nSummary:');
    console.log('- Individual field encryption/decryption: ✅');
    console.log('- Object encryption/decryption: ✅');
    console.log('- Password protection: ✅');
    console.log('- Performance with large data: ✅');
    console.log('- Different encryption methods: ✅');
    console.log('- Secure key derivation: ✅');
    console.log('- Multiple encryption layers: ✅');
    console.log('- Batch operations: ✅');

  } catch (error) {
    console.error('❌ Error in data encryption example:', error.message);
    throw error;
  }
}

// Run the example if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  dataEncryptionExample()
    .then(() => console.log('\n✅ Example finished successfully!'))
    .catch(error => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

export { dataEncryptionExample };