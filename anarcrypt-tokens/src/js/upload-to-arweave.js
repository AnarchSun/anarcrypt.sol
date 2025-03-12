const Arweave = require('arweave');
const fs = require('fs');

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

async function uploadToArweave(filePath, key) {
    const data = fs.readFileSync(filePath);
    const transaction = await arweave.createTransaction({ data: data }, key);
    
    transaction.addTag('Content-Type', 'application/json');

    await arweave.transactions.sign(transaction, key);
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200) {
        console.log(`File uploaded to Arweave. Transaction ID: ${transaction.id}`);
        return `https://arweave.net/${transaction.id}`;
    } else {
        throw new Error('Failed to upload to Arweave');
    }
}

module.exports = { uploadToArweave };
