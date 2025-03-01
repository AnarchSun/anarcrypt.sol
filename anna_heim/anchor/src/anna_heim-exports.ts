// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import AnnaHeimIDL from '../target/idl/anna_heim.json'
import type { AnnaHeim } from '../target/types/anna_heim'

// Re-export the generated IDL and type
export { AnnaHeim, AnnaHeimIDL }

// The programId is imported from the program IDL.
export const ANNA_HEIM_PROGRAM_ID = new PublicKey(AnnaHeimIDL.address)

// This is a helper function to get the AnnaHeim Anchor program.
export function getAnnaHeimProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...AnnaHeimIDL, address: address ? address.toBase58() : AnnaHeimIDL.address } as AnnaHeim, provider)
}

// This is a helper function to get the program ID for the AnnaHeim program depending on the cluster.
export function getAnnaHeimProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the AnnaHeim program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return ANNA_HEIM_PROGRAM_ID
  }
}
