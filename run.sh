#!/bin/bash

cd "$(realpath $(dirname $0))"

git pull -X theirs

NETWORK=voitestnet node index.js
NETWORK=betanet node index.js
NETWORK=testnet node index.js
NETWORK=mainnet node index.js

git add -A .

git commit -am "data $(date --utc)"

git push

git gc --aggressive

git prune
