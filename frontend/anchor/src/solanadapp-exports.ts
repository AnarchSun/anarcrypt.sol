// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolanadappIDL from '../target/idl/solanadapp.json'
import type { Solanadapp } from '../target/types/solanadapp'

// Re-export the generated IDL and type
export { Solanadapp, SolanadappIDL }

// The programId is imported from the program IDL.
export const SOLANADAPP_PROGRAM_ID = new PublicKey(SolanadappIDL.address)

// This is a helper function to get the Solanadapp Anchor program.
export function getSolanadappProgram(provider: AnchorProvider) {
  return new Program(SolanadappIDL as Solanadapp, provider)
}

// This is a helper function to get the program ID for the Solanadapp program depending on the cluster.
export function getSolanadappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solanadapp program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return SOLANADAPP_PROGRAM_ID
  }
}
