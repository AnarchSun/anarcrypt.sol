# Billeterias Boss y Mnt:

## El Boss wallet (con autoridad de creator)
Wrote keypair to bosNRevwS7EmuYhj4ZUXD3MCwX3MDyY9ffXSnaGcsBV.json

Wallet address: bosNRevwS7EmuYhj4ZUXD3MCwX3MDyY9ffXSnaGcsBV

## El Mnt (Mint Token Address):

mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK.json

## Token Mint Address on the Blockchainm:

mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK

### Contractos y signaturas del token:

spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK.json
Creating token mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK
Decimals:  9

Signature: 3R3D19suJ2QuZK7dEz3hdJnnmnt2euQeBUC6W8Pqtip1Cu5NHgrLk2ZY9NH1yPJSSPGc2zqjSYQpaRLnvCY3m4E9

### Initiate-metadata:

spl-token initialize-metadata mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK  "Fruit€oin" "FR€" "https://raw.githubusercontent.com/RastaDjuss/anarcrypt_tokens/refs/heads/main/fruit-token/billeterias/metadata.json"

Signature: 3xs8d8wAbxArVBcuhw8R2GCAUCLQUipwngFnAtAceFgiRWsg1bpv93xsqZMUXPqKwy4d9zBZ3qjm3XEs8UQN8HMrsolana confirm -v

### Created account:

spl-token create-account  mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK
Creating account LpC7yjUnUERg9nbem1VfxjzrtTpbonmE9C9xMJ4eMWU

Signature: 3zSpi41VPCDixHkTKW6CWXFa5ie86skrbsGMCwew1pJa8gkM2kWiY8iVVhvwdx8q9bMdBnYrBHDiv8UgWTMpPxsR

### Minted Tokens:

spl-token mint  mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK  31000666
Minting 31000666 tokens
Token: mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK
Recipient: LpC7yjUnUERg9nbem1VfxjzrtTpbonmE9C9xMJ4eMWU

Signature: HwTWGpshSqfEwtvYGbiKHqjpZWA4AoGEjpDiaQKVuw6QJp2yZMR5C9a8UWJRNCVMXmptmAmZRihZfDcnMq8enXq

###  Revoke Mint authority...

spl-token authorize mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK  mint --disable
Updating mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK
Current mint: bosNRevwS7EmuYhj4ZUXD3MCwX3MDyY9ffXSnaGcsBV
New mint: disabled

Signature: sqm1Admk8ZJkcWKEd4GnhWsGZfNJttn3cytm8QDN62SaoLMyz6M5VUoebur2Ra3NBcWP5GUoKi4KVmp3nkP9oph

### Revoke Freeze authority...

can't...

## Transfer to Oswald:

spl-token transfer  mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK  30000666 7ZrZVzxXbZeH4kBfNoyBfbTSef8L7WVupnQaj2jau3GK --fund-recipient --allow-unfunded-recipient
Transfer 30000666 tokens
Sender: LpC7yjUnUERg9nbem1VfxjzrtTpbonmE9C9xMJ4eMWU
Recipient: 7ZrZVzxXbZeH4kBfNoyBfbTSef8L7WVupnQaj2jau3GK
Recipient associated token account: 3wepPBaXDSBF4Z7SH8tESAobnFXCgYoaGxtD7z8bP1se
Funding recipient: 3wepPBaXDSBF4Z7SH8tESAobnFXCgYoaGxtD7z8bP1se

Signature: 2bu3VfLH78cPqmVfWB6sjsmcJDtCoFADpMyugeAbjhs5T4FgSgKJWx7vMEgckbnqDiqNS1u7xz76wuV4xBW8ZDHa

 y un million para Justin El KREATOR!!

spl-token transfer  mntLShQnsf7qGmFhdAHcpr6iZaMm4Bhzb4qLoDxuXeK  1000000 AbonnfiKsnovfQUEeBX3U57BdDiESGi2UEFXw2X711cY  --fund-recipient --allow-unfunded-recipient
Transfer 1000000 tokens
Sender: LpC7yjUnUERg9nbem1VfxjzrtTpbonmE9C9xMJ4eMWU
Recipient: AbonnfiKsnovfQUEeBX3U57BdDiESGi2UEFXw2X711cY
Recipient associated token account: Fdutxv7mMyoQqvV7rJtXfQAPqtm9oukuiGHM7AaHNBEP
Funding recipient: Fdutxv7mMyoQqvV7rJtXfQAPqtm9oukuiGHM7AaHNBEP

Signature: 2qdg1V3oz2oK6WEtBGbRGyj6hzLwRZTKjyzyGKYjJbVCc7qyjpyYeGrWzGZ6266ENnJwUjCm7gJer68TT7aELdvN

#### The End Buena navidad millionairo!!