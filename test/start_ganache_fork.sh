#! /usr/bin/env sh

DIR=$(dirname "$0")
cd "$DIR"

source ../.env

ganache-cli --mnemonic "$MNEMONIC" --fork "https://ropsten.infura.io/v3/$INFURA_ID" --gasLimit 10000000
