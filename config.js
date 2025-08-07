import algosdk from 'algosdk';

export const indexers = {
  mainnet: new algosdk.Indexer('', 'https://mainnet-idx.4160.nodely.dev', 443),
  testnet: new algosdk.Indexer('', 'https://testnet-idx.4160.nodely.dev', 443),
  betanet: new algosdk.Indexer('', 'https://betanet-idx.4160.nodely.dev', 443),
  voitestnet: new algosdk.Indexer('', 'https://testnet-idx.voi.nodly.io', 443),
};
