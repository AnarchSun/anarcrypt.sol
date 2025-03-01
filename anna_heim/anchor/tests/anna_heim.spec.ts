import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {AnnaHeim} from '../target/types/anna_heim'

describe('anna_heim', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.AnnaHeim as Program<AnnaHeim>

  const anna_heimKeypair = Keypair.generate()

  it('Initialize AnnaHeim', async () => {
    await program.methods
      .initialize()
      .accounts({
        anna_heim: anna_heimKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([anna_heimKeypair])
      .rpc()

    const currentCount = await program.account.anna_heim.fetch(anna_heimKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment AnnaHeim', async () => {
    await program.methods.increment().accounts({ anna_heim: anna_heimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anna_heim.fetch(anna_heimKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment AnnaHeim Again', async () => {
    await program.methods.increment().accounts({ anna_heim: anna_heimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anna_heim.fetch(anna_heimKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement AnnaHeim', async () => {
    await program.methods.decrement().accounts({ anna_heim: anna_heimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anna_heim.fetch(anna_heimKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set anna_heim value', async () => {
    await program.methods.set(42).accounts({ anna_heim: anna_heimKeypair.publicKey }).rpc()

    const currentCount = await program.account.anna_heim.fetch(anna_heimKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the anna_heim account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        anna_heim: anna_heimKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.anna_heim.fetchNullable(anna_heimKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
