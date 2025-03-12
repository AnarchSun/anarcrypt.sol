// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import AnaheimIDL from '../target/idl/anaheim.json'
import type { Anaheim } from '../target/types/anaheim'

// Re-export the generated IDL and type
export { Anaheim, AnaheimIDL }

// The programId is imported from the program IDL.
export const ANAHEIM_PROGRAM_ID = new PublicKey(AnaheimIDL.address)

// This is a helper function to get the Anaheim Anchor program.
export function getAnaheimProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...AnaheimIDL, address: address ? address.toBase58() : AnaheimIDL.address } as Anaheim, provider)
}

// This is a helper function to get the program ID for the Anaheim program depending on the cluster.
export function getAnaheimProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Anaheim program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return ANAHEIM_PROGRAM_ID
  }
}
