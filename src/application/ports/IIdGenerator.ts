/**
 * Port Interface — IIdGenerator
 *
 * Abstracts the mechanism for generating unique IDs.
 * The implementation (uuid, cuid, nanoid, etc.) lives in infrastructure/.
 */
export interface IIdGenerator {
  generate(): string;
}
