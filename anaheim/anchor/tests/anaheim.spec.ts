import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Anaheim } from '../target/types/anaheim'

describe('anaheim', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Anaheim as Program<Anaheim>

  const anaheimKeypair = Keypair.generate()

  it('Initialize Anaheim', async () => {
    await program.methods
      .initialize()
      .accounts({
        anaheim: anaheimKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([anaheimKeypair])
      .rpc()

    const currentCount = await program.account.anaheim.fetch(anaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Anaheim', async () => {
    await program.methods.increment().accounts({ anaheim: anaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anaheim.fetch(anaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Anaheim Again', async () => {
    await program.methods.increment().accounts({ anaheim: anaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anaheim.fetch(anaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Anaheim', async () => {
    await program.methods.decrement().accounts({ anaheim: anaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anaheim.fetch(anaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set anaheim value', async () => {
    await program.methods.set(42).accounts({ anaheim: anaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anaheim.fetch(anaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the anaheim account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        anaheim: anaheimKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.anaheim.fetchNullable(anaheimKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
