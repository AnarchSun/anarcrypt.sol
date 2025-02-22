// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import AnnaheimIDL from '../target/idl/annaheim.json'
import type { Annaheim } from '../target/types/annaheim'

// Re-export the generated IDL and type
export { Annaheim, AnnaheimIDL }

// The programId is imported from the program IDL.
export const ANNAHEIM_PROGRAM_ID = new PublicKey(AnnaheimIDL.address)

// This is a helper function to get the Annaheim Anchor program.
export function getAnnaheimProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...AnnaheimIDL, address: address ? address.toBase58() : AnnaheimIDL.address } as Annaheim, provider)
}

// This is a helper function to get the program ID for the Annaheim program depending on the cluster.
export function getAnnaheimProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Annaheim program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return ANNAHEIM_PROGRAM_ID
  }
}
