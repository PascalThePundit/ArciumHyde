// tests/arcium_encrypted_compute.rs
use anchor_lang::prelude::*;
use anchor_test::{ProgramTest, ProgramTestContext};
use solana_sdk::{signature::Keypair, signer::Signer, transaction::Transaction, pubkey::Pubkey};
use arcium_encrypted_compute::program::ArciumEncryptedCompute;

#[tokio::test]
async fn test_initialize_encrypted_compute() {
    // Set up program test context
    let mut program_test = ProgramTest::new(
        "arcium_encrypted_compute",
        arcium_encrypted_compute::ID,
        None,
    );

    let mut context = program_test.start_with_context().await;
    
    let data_hash = "test_hash_123";
    let encrypted_compute_account = Keypair::new();
    let user = context.payer.pubkey();

    // Create and send the transaction to initialize encrypted compute
    let accounts = arcium_encrypted_compute::accounts::InitializeEncryptedCompute {
        encrypted_compute: encrypted_compute_account.pubkey(),
        user,
        system_program: solana_sdk::system_program::ID,
    };

    let instruction = arcium_encrypted_compute::instruction::InitializeEncryptedCompute {
        data_hash: data_hash.to_string(),
    };

    let transaction = Transaction::new_signed_with_payer(
        &[instruction.into()],
        Some(&context.payer.pubkey()),
        &[&context.payer, &encrypted_compute_account],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(transaction).await.unwrap();
    
    // Verify the account was created properly
    let account = context.banks_client.get_account(encrypted_compute_account.pubkey()).await.unwrap();
    assert!(account.is_some());
}