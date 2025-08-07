#!/bin/bash

cd "$(realpath $(dirname $0))"

echo Started $(date)

./pull.sh

# NETWORK=voitestnet node index.js
NETWORK=betanet node index.js
NETWORK=testnet node index.js
NETWORK=mainnet node index.js

git add -A .

git commit -am "data $(date --utc)"

git push

if [ "$1" == "gc" ]; then
	git gc

	git prune
fi

echo Finished $(date)
