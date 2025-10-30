/**
 * Example: Account Balance Verification using Zero-Knowledge Proofs
 * 
 * This example demonstrates how to prove that an account has sufficient funds
 * without revealing the exact balance.
 */

import ArciumPrivacy from '../dist/index.js'; // Adjust path as needed

// In a real application, you would use your actual API key
const API_KEY = process.env.ARCIUM_API_KEY || 'YOUR_API_KEY_HERE';

async function balanceVerificationExample() {
  console.log('💰 Balance Verification Example');
  console.log('================================\n');

  // Initialize the privacy SDK
  const privacy = new ArciumPrivacy({
    apiKey: API_KEY,
    debug: true
  });

  // Simulate a user with account balance $2,500 (kept private)
  const userBalance = 2500;
  const minimumRequired = 1000;
  console.log(`User's actual balance: $${userBalance} (kept private)`);
  console.log(`Minimum required: $${minimumRequired}\n`);

  try {
    // Step 1: Generate a zero-knowledge proof that the balance is above the minimum
    console.log('1️⃣ Generating balance proof (that balance ≥ $1000)...');
    const balanceProof = await privacy.prove('balance', {
      balance: userBalance,
      threshold: minimumRequired
    });
    
    console.log('✅ Balance proof generated successfully!\n');
    console.log('Proof details:');
    console.log('- Can verify balance ≥ $1000 without knowing exact amount');
    console.log('- Proof contains no information about actual balance\n');

    // Step 2: Verify the proof (this can be done by any verifier)
    console.log('2️⃣ Verifying the balance proof...');
    const isValid = await privacy.verify(balanceProof);
    
    if (isValid) {
      console.log('✅ Proof is valid! User has verified they have at least $1000.\n');
    } else {
      console.log('❌ Proof verification failed!\n');
      return;
    }

    // Step 3: Try with insufficient balance to show it fails
    console.log('3️⃣ Testing with insufficient balance ($500)...');
    try {
      await privacy.prove('balance', {
        balance: 500,
        threshold: minimumRequired
      });
      console.log('   This should not reach here - proof generation should fail for insufficient balance\n');
    } catch (error) {
      console.log(`   ✅ Expected error for insufficient balance: ${error.message}\n`);
    }

    // Step 4: Generate various balance proofs for different thresholds
    console.log('4️⃣ Generating proofs for different thresholds...');
    
    const thresholds = [500, 1000, 2000, 3000];
    const proofPromises = thresholds.map(threshold => 
      privacy.prove('balance', {
        balance: userBalance,
        threshold
      })
    );
    
    const proofs = await Promise.allSettled(proofPromises);
    
    console.log('Verification results for each threshold:');
    for (let i = 0; i < proofs.length; i++) {
      const threshold = thresholds[i];
      const proofResult = proofs[i];
      
      if (proofResult.status === 'fulfilled') {
        const isValid = await privacy.verify(proofResult.value);
        const meetsThreshold = userBalance >= threshold;
        console.log(`   $${threshold}: ${isValid ? '✅' : '❌'} (Expected: ${meetsThreshold ? '✅' : '❌'})`);
      } else {
        console.log(`   $${threshold}: ❌ Error - ${proofResult.reason.message}`);
      }
    }
    console.log('');

    // Step 5: Create a verifiable balance claim
    console.log('5️⃣ Creating verifiable balance claim...');
    const balanceClaim = await privacy.issueClaim({
      type: 'balance_verification',
      subject: 'account-xyz',
      attributes: { balance: userBalance },
      disclosurePolicy: {
        public: [], // Nothing public
        conditional: [{
          attribute: 'balance',
          condition: `balance >= ${minimumRequired}`,
          requiredBy: ['service-provider'] // Only approved services can verify
        }],
        private: ['balance'] // Keep exact balance private
      }
    });

    console.log('✅ Balance claim created successfully!');
    console.log('   - Contains ZK proof of sufficient funds');
    console.log('   - Exact balance kept private');
    console.log('   - Can be selectively disclosed\n');

    // Step 6: Create a disclosure request for balance verification
    console.log('6️⃣ Creating disclosure request for balance verification...');
    const disclosureRequest = await privacy.createDisclosureRequest({
      verifier: 'payment-service',
      requestedClaims: [{
        type: 'balance_verification',
        requiredAttributes: ['balance'],
        conditions: { 'balance': `balance >= ${minimumRequired}` }
      }],
      justification: 'Balance verification required for transaction approval'
    });

    console.log('✅ Disclosure request created!');
    console.log('   - Can be sent to user for approval\n');

    // Step 7: Respond to the disclosure request
    console.log('7️⃣ Responding to disclosure request...');
    const disclosureResponse = await privacy.respondToDisclosureRequest(
      disclosureRequest, 
      [balanceClaim]
    );

    console.log('✅ Disclosure response created!');
    console.log('   - Contains proof without revealing exact balance\n');

    // Step 8: Verify the disclosure response
    console.log('8️⃣ Verifying disclosure response...');
    const responseValid = await privacy.verifyDisclosure(
      disclosureResponse, 
      disclosureRequest
    );

    if (responseValid) {
      console.log('✅ Disclosure response is valid!');
      console.log('   - Payment service can now trust the balance verification\n');
    } else {
      console.log('❌ Disclosure response verification failed!\n');
    }

    // Step 9: Demonstrate different verification scenarios
    console.log('9️⃣ Testing different verification scenarios...');
    
    // Scenario 1: User with exactly the minimum amount
    console.log('   Scenario 1: User with exactly minimum required balance ($1000)...');
    const exactBalanceClaim = await privacy.issueClaim({
      type: 'balance_verification',
      subject: 'account-exact',
      attributes: { balance: minimumRequired },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'balance',
          condition: `balance >= ${minimumRequired}`,
          requiredBy: ['service']
        }],
        private: ['balance']
      }
    });
    
    const exactProof = await privacy.prove('balance', {
      balance: minimumRequired,
      threshold: minimumRequired
    });
    
    const exactValid = await privacy.verify(exactProof);
    console.log(`   Balance exactly at threshold ($${minimumRequired}) verified: ${exactValid ? '✅' : '❌'}\n`);

    // Scenario 2: User with very high balance
    console.log('   Scenario 2: User with high balance ($10,000)...');
    const highProof = await privacy.prove('balance', {
      balance: 10000,
      threshold: minimumRequired
    });
    
    const highValid = await privacy.verify(highProof);
    console.log(`   High balance verified: ${highValid ? '✅' : '❌'}\n`);

    console.log('🎉 Balance verification example completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in balance verification example:', error.message);
    throw error;
  }
}

// Run the example if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  balanceVerificationExample()
    .then(() => console.log('\n✅ Example finished successfully!'))
    .catch(error => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

export { balanceVerificationExample };