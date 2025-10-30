import { PrivacyPrimitive } from '../types';
import { EncryptionService } from '../services/encryption';
import { ZkProofService } from '../services/zkproof';
import { SelectiveDisclosureService } from '../services/selective-disclosure';
import { PrimitiveRegistry } from '../services/PrimitiveRegistry';
import { EncryptionPrimitive, DecryptionPrimitive } from '../primitives/EncryptionPrimitives';
import { RangeProofPrimitive, BalanceProofPrimitive } from '../primitives/ZkProofPrimitives';

export class PrimitiveFactory {
  static createStandardPrimitives(
    encryptionService: EncryptionService,
    zkProofService: ZkProofService,
    selectiveDisclosureService: SelectiveDisclosureService
  ): PrivacyPrimitive[] {
    return [
      new EncryptionPrimitive(encryptionService),
      new DecryptionPrimitive(encryptionService),
      new RangeProofPrimitive(zkProofService),
      new BalanceProofPrimitive(zkProofService),
      // Add more primitives here as needed
    ];
  }

  static registerStandardPrimitives(
    registry: PrimitiveRegistry,
    encryptionService: EncryptionService,
    zkProofService: ZkProofService,
    selectiveDisclosureService: SelectiveDisclosureService
  ): void {
    const primitives = this.createStandardPrimitives(
      encryptionService,
      zkProofService,
      selectiveDisclosureService
    );

    for (const primitive of primitives) {
      registry.registerPrimitive(primitive);
    }
  }
}