/**
 * Example: Age Verification using Zero-Knowledge Proofs
 * 
 * This example demonstrates how to verify that a user is over 18
 * without revealing their exact age.
 */

import ArciumPrivacy from '../dist/index.js'; // Adjust path as needed

// In a real application, you would use your actual API key
const API_KEY = process.env.ARCIUM_API_KEY || 'YOUR_API_KEY_HERE';

async function ageVerificationExample() {
  console.log('🔐 Age Verification Example');
  console.log('============================\n');

  // Initialize the privacy SDK
  const privacy = new ArciumPrivacy({
    apiKey: API_KEY,
    debug: true
  });

  // Simulate a user with age 25 (kept private)
  const userAge = 25;
  console.log(`User's actual age: ${userAge} (kept private)\n`);

  try {
    // Step 1: Generate a zero-knowledge proof that the user is at least 18
    console.log('1️⃣ Generating age proof (that age ≥ 18)...');
    const ageProof = await privacy.prove('range', {
      value: userAge,
      min: 18,  // Minimum required age
      max: 100  // Maximum possible age
    });
    
    console.log('✅ Age proof generated successfully!\n');
    console.log('Proof details:');
    console.log('- Can verify user is ≥ 18 without knowing exact age');
    console.log('- Proof contains no information about actual age\n');

    // Step 2: Verify the proof (this can be done by any verifier)
    console.log('2️⃣ Verifying the age proof...');
    const isValid = await privacy.verify(ageProof);
    
    if (isValid) {
      console.log('✅ Proof is valid! User has verified they are at least 18.\n');
    } else {
      console.log('❌ Proof verification failed!\n');
      return;
    }

    // Step 3: Try with a minor (under 18) to show it fails
    console.log('3️⃣ Testing with a minor (age 16)...');
    try {
      const minorAge = 16;
      const minorProof = await privacy.prove('range', {
        value: minorAge,
        min: 18,
        max: 100
      });
      
      const minorValid = await privacy.verify(minorProof);
      console.log(`   Minor proof valid: ${minorValid}`);
      console.log('   Note: The proof itself is valid, but it proves age ≥ 18 is false.\n');
    } catch (error) {
      console.log(`   Expected error for minor: ${error.message}\n`);
    }

    // Step 4: Create a verifiable claim for age verification
    console.log('4️⃣ Creating verifiable age claim...');
    const ageClaim = await privacy.issueClaim({
      type: 'age_verification',
      subject: 'user-789',
      attributes: { age: userAge },
      disclosurePolicy: {
        public: [], // Nothing public
        conditional: [{
          attribute: 'age',
          condition: 'age >= 18',
          requiredBy: ['verifier-service'] // Only approved verifiers can check
        }],
        private: ['age'] // Keep exact age private
      }
    });

    console.log('✅ Age claim created successfully!');
    console.log('   - Contains ZK proof of age');
    console.log('   - Exact age kept private');
    console.log('   - Can be selectively disclosed\n');

    // Step 5: Create a disclosure request
    console.log('5️⃣ Creating disclosure request...');
    const disclosureRequest = await privacy.createDisclosureRequest({
      verifier: 'service-provider',
      requestedClaims: [{
        type: 'age_verification',
        requiredAttributes: ['age'],
        conditions: { 'age': 'age >= 18' }
      }],
      justification: 'Age verification required for service access'
    });

    console.log('✅ Disclosure request created!');
    console.log('   - Can be sent to user for approval\n');

    // Step 6: Respond to the disclosure request (simplified)
    console.log('6️⃣ Responding to disclosure request...');
    const disclosureResponse = await privacy.respondToDisclosureRequest(
      disclosureRequest, 
      [ageClaim]
    );

    console.log('✅ Disclosure response created!');
    console.log('   - Contains proof without revealing exact age\n');

    // Step 7: Verify the disclosure response
    console.log('7️⃣ Verifying disclosure response...');
    const responseValid = await privacy.verifyDisclosure(
      disclosureResponse, 
      disclosureRequest
    );

    if (responseValid) {
      console.log('✅ Disclosure response is valid!');
      console.log('   - Service provider can now trust the age verification\n');
    } else {
      console.log('❌ Disclosure response verification failed!\n');
    }

    console.log('🎉 Age verification example completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in age verification example:', error.message);
    throw error;
  }
}

// Run the example if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  ageVerificationExample()
    .then(() => console.log('\n✅ Example finished successfully!'))
    .catch(error => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

export { ageVerificationExample };