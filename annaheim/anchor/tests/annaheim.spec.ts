import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Annaheim} from '../target/types/annaheim'

describe('annaheim', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Annaheim as Program<Annaheim>

  const annaheimKeypair = Keypair.generate()

  it('Initialize Annaheim', async () => {
    await program.methods
      .initialize()
      .accounts({
        annaheim: annaheimKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([annaheimKeypair])
      .rpc()

    const currentCount = await program.account.annaheim.fetch(annaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Annaheim', async () => {
    await program.methods.increment().accounts({ annaheim: annaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.annaheim.fetch(annaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Annaheim Again', async () => {
    await program.methods.increment().accounts({ annaheim: annaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.annaheim.fetch(annaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Annaheim', async () => {
    await program.methods.decrement().accounts({ annaheim: annaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.annaheim.fetch(annaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set annaheim value', async () => {
    await program.methods.set(42).accounts({ annaheim: annaheimKeypair.publicKey }).rpc()

    const currentCount = await program.account.annaheim.fetch(annaheimKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the annaheim account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        annaheim: annaheimKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.annaheim.fetchNullable(annaheimKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
