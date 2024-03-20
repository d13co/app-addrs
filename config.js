import algosdk from 'algosdk';

export const indexers = {
  mainnet: new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443),
  testnet: new algosdk.Indexer('', 'https://testnet-idx.algonode.cloud', 443),
  betanet: new algosdk.Indexer('', 'https://betanet-idx.algonode.cloud', 443),
  voitestnet: new algosdk.Indexer('', 'https://testnet-idx.voi.nodly.io', 443),
};
