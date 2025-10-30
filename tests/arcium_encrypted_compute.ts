// tests/arcium_encrypted_compute.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ArciumEncryptedCompute } from "../target/types/arcium_encrypted_compute";
import { expect } from "chai";
import { Keypair } from "@solana/web3.js";

describe("arcium-encrypted-compute", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ArciumEncryptedCompute as Program<ArciumEncryptedCompute>;

  it("Should initialize an encrypted compute account", async () => {
    // Add your test here
    const dataHash = "test_hash_123";
    const encryptedComputeKeypair = Keypair.generate();
    
    const tx = await program.methods
      .initializeEncryptedCompute(dataHash)
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([encryptedComputeKeypair])
      .rpc();

    console.log("Initialize transaction signature", tx);

    const account = await program.account.encryptedCompute.fetch(encryptedComputeKeypair.publicKey);
    console.log("Retrieved account:", account);
    expect(account.dataHash).to.equal(dataHash);
    expect(account.authority.toString()).to.equal(program.provider.publicKey.toString());
    expect(account.status).to.equal("initialized");
  });

  it("Should update encrypted data", async () => {
    const dataHash = "test_hash_456";
    const encryptedComputeKeypair = Keypair.generate();
    
    // First initialize the account
    await program.methods
      .initializeEncryptedCompute(dataHash)
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([encryptedComputeKeypair])
      .rpc();

    // Then update the encrypted data
    const encryptedData = "encrypted_data_123";
    const tx = await program.methods
      .updateEncryptedData(encryptedData)
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
      })
      .rpc();

    console.log("Update transaction signature", tx);

    const account = await program.account.encryptedCompute.fetch(encryptedComputeKeypair.publicKey);
    expect(account.encryptedData).to.equal(encryptedData);
    expect(account.status).to.equal("updated");
  });

  it("Should process encrypted computation", async () => {
    const dataHash = "test_hash_789";
    const encryptedComputeKeypair = Keypair.generate();
    
    // First initialize the account
    await program.methods
      .initializeEncryptedCompute(dataHash)
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([encryptedComputeKeypair])
      .rpc();

    // Then update with some encrypted data
    const encryptedData = "encrypted_data_456";
    await program.methods
      .updateEncryptedData(encryptedData)
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
      })
      .rpc();

    // Then process the computation
    const tx = await program.methods
      .processEncryptedComputation()
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
      })
      .rpc();

    console.log("Process transaction signature", tx);

    const account = await program.account.encryptedCompute.fetch(encryptedComputeKeypair.publicKey);
    expect(account.status).to.equal("processed");
  });

  it("Should close encrypted compute account", async () => {
    const dataHash = "test_hash_close";
    const encryptedComputeKeypair = Keypair.generate();
    
    // First initialize the account
    await program.methods
      .initializeEncryptedCompute(dataHash)
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([encryptedComputeKeypair])
      .rpc();

    // Then close the account
    const tx = await program.methods
      .closeEncryptedCompute()
      .accounts({
        encryptedCompute: encryptedComputeKeypair.publicKey,
        user: program.provider.publicKey,
      })
      .rpc();

    console.log("Close transaction signature", tx);

    const account = await program.account.encryptedCompute.fetch(encryptedComputeKeypair.publicKey);
    expect(account.status).to.equal("closed");
  });
});