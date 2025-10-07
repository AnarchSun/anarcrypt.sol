const { Connection } = require('@solana/web3.js');

// Configurez l'URL provenant de QuickNode
const QUICKNODE_RPC_URL = "https://<some_endpoint>.solana-mainnet.quiknode.pro/<your_api_key>/";

// Créez une connexion avec Solana
const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');