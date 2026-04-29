import { v4 as uuidv4 } from 'uuid';

import type { IIdGenerator } from '@/application/ports/IIdGenerator';

/**
 * Adapter — UuidGenerator
 *
 * Implements the IIdGenerator port using the `uuid` library.
 * All third-party ID library knowledge is isolated here.
 */
export class UuidGenerator implements IIdGenerator {
  generate(): string {
    return uuidv4();
  }
}
