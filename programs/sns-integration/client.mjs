import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";
import { readFileSync } from 'fs';
import os from 'os';
import path from 'path';

async function main() {
    // Load the wallet with SOL
    const walletKeypairData = JSON.parse(readFileSync(path.join(os.homedir(), '.config/solana/id.json'), 'utf8'));
    const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData));
    console.log("Wallet keypair loaded");

    const programId = new PublicKey("F6kD2SC2GZ8s2zhMhhzsDf6Hc8S8BptLg9Ek4QQ1XZ8e");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const blockhashInfo = await connection.getLatestBlockhash();
    console.log("Blockhash connected");

    const tx = new Transaction({
        ...blockhashInfo,
        feePayer: walletKeypair.publicKey
    });

    tx.add(new TransactionInstruction({
        programId: programId,
        keys: [],
        data: Buffer.from([])
    }));

    tx.sign(walletKeypair);
    const txHash = await connection.sendRawTransaction(tx.serialize());
    
    await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        signature: txHash
    });

    console.log(`View transaction: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
}

main();
