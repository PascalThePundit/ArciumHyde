import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet, web3 } from '@coral-xyz/anchor';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { logger } from '../utils/logger';

export interface SolanaConfig {
  clusterUrl: string;
  programId?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface SolanaTransactionResult {
  signature: string;
  slot: number;
  success: boolean;
  error?: string;
}

export class SolanaIntegration {
  private connection: Connection;
  private provider: AnchorProvider | null = null;
  private program: Program | null = null;
  private defaultConfig: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.defaultConfig = config;
    this.connection = new Connection(config.clusterUrl, config.commitment || 'confirmed');
  }

  /**
   * Initialize the Solana provider with wallet
   */
  initializeProvider(wallet: Wallet, commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'): void {
    if (!wallet.publicKey) {
      throw new WalletNotConnectedError();
    }

    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment, preflightCommitment: commitment }
    );
  }

  /**
   * Verify wallet connection
   */
  async verifyWalletConnection(): Promise<boolean> {
    try {
      if (!this.provider) {
        return false;
      }

      const publicKey = this.provider.wallet.publicKey;
      const balance = await this.connection.getBalance(publicKey);
      
      logger.info('Wallet connected successfully', { 
        publicKey: publicKey.toBase58(), 
        balance 
      });
      
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Wallet connection verification failed', { error: err.message });
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error getting balance', { error: err.message, publicKey: publicKey.toBase58() });
      throw error;
    }
  }

  /**
   * Create privacy-enabled transaction
   */
  async createPrivacyTransaction(
    encryptedData: Uint8Array,
    recipient: PublicKey,
    amount: number
  ): Promise<SolanaTransactionResult> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // Create transaction with encrypted data
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.provider.wallet.publicKey,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Add encrypted data as instruction (simplified approach)
      // In a real implementation, this would use the privacy program
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [ (this.provider.wallet as any).payer ] // Assuming payer is available
      );

      logger.info('Privacy transaction created', { 
        signature, 
        recipient: recipient.toBase58(),
        amount 
      });

      return {
        signature,
        slot: await this.connection.getSlot(),
        success: true
      };
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Privacy transaction failed', { error: err.message });
      return {
        signature: '',
        slot: 0,
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Send encrypted data to privacy-enabled smart contract
   */
  async sendEncryptedData(
    data: Uint8Array,
    contractAddress: PublicKey
  ): Promise<SolanaTransactionResult> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // Create a transaction to send encrypted data to privacy contract
      const transaction = new Transaction();

      // This would use actual privacy program instructions
      // For now, we'll simulate with a transfer transaction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.provider.wallet.publicKey,
          toPubkey: contractAddress,
          lamports: 0.01 * LAMPORTS_PER_SOL, // Small fee
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [ (this.provider.wallet as any).payer ]
      );

      logger.info('Encrypted data sent to contract', {
        signature,
        contract: contractAddress.toBase58()
      });

      return {
        signature,
        slot: await this.connection.getSlot(),
        success: true
      };
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Sending encrypted data failed', { error: err.message });
      return {
        signature: '',
        slot: 0,
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Interact with privacy-enabled contracts
   */
  async interactWithPrivacyContract(
    contractAddress: PublicKey,
    instruction: string,
    data: Uint8Array
  ): Promise<SolanaTransactionResult> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // In a real implementation, this would call actual privacy contract methods
      // For now, we simulate the interaction
      const transaction = new Transaction();

      // Add instruction to interact with privacy contract
      transaction.add({
        keys: [
          { pubkey: this.provider.wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: contractAddress, isSigner: false, isWritable: true },
        ],
        programId: SystemProgram.programId,
        data: Buffer.from(instruction),
      });

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [ (this.provider.wallet as any).payer ]
      );

      logger.info('Privacy contract interaction', { 
        signature, 
        contract: contractAddress.toBase58(),
        instruction 
      });

      return {
        signature,
        slot: await this.connection.getSlot(),
        success: true
      };
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Privacy contract interaction failed', { error: err.message });
      return {
        signature: '',
        slot: 0,
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Get privacy-enabled account state
   */
  async getPrivacyAccountState(accountAddress: PublicKey): Promise<any> {
    try {
      // Fetch account state from blockchain
      const accountInfo = await this.connection.getAccountInfo(accountAddress);
      
      if (!accountInfo) {
        throw new Error(`Account not found: ${accountAddress.toBase58()}`);
      }

      // In a real implementation, this would parse privacy-specific account data
      // For now, return basic account info
      return {
        executable: accountInfo.executable,
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
        data: accountInfo.data.toString('base64')
      };
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error getting account state', { error: err.message });
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { isConnected: boolean; cluster: string; slot: number } {
    return {
      isConnected: this.connection !== undefined,
      cluster: this.defaultConfig.clusterUrl,
      slot: 0  // In a real implementation, this would fetch current slot
    };
  }

  /**
   * Get the Solana connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the provider instance
   */
  getProvider(): AnchorProvider | null {
    return this.provider;
  }

  /**
   * Request airdrop for testing
   */
  async requestAirdrop(publicKey: PublicKey, amount: number): Promise<string> {
    try {
      const signature = await this.connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
      await this.connection.confirmTransaction(signature);
      
      logger.info('Airdrop successful', { signature, publicKey: publicKey.toBase58(), amount });
      return signature;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Airdrop failed', { error: err.message });
      throw error;
    }
  }
}