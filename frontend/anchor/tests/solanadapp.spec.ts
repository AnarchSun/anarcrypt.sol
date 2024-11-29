import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Solanadapp} from '../target/types/solanadapp'

describe('solanadapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solanadapp as Program<Solanadapp>

  const solanadappKeypair = Keypair.generate()

  it('Initialize Solanadapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        solanadapp: solanadappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([solanadappKeypair])
      .rpc()

    const currentCount = await program.account.solanadapp.fetch(solanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solanadapp', async () => {
    await program.methods.increment().accounts({ solanadapp: solanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanadapp.fetch(solanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solanadapp Again', async () => {
    await program.methods.increment().accounts({ solanadapp: solanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanadapp.fetch(solanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solanadapp', async () => {
    await program.methods.decrement().accounts({ solanadapp: solanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanadapp.fetch(solanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solanadapp value', async () => {
    await program.methods.set(42).accounts({ solanadapp: solanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanadapp.fetch(solanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solanadapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solanadapp: solanadappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solanadapp.fetchNullable(solanadappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
