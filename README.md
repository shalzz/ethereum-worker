# Ethereum worker

A scaling solution for Ethereum nodes by caching responses using Clouldflares
technologies like Argo tunnels and Cloudflare workers.

This is very similar to the official Cloudflare Ethereum Gateway service
provided by Cloudflare [here][1] but allows you to run and configure your own geth
or parity node and put it behind a global edge computing network with robust caching
facilities.

## Philosophy

With the immutable property of blockchains and a block based model it is easier
to aggressively cache a response without worrying about invalidating a cache on updates/writes
within a block rather than indexing individual transactions and blocks to store
in a database which are unlikely to change save for the latest few blocks
(80-100 for ethereum) to account for a chain re-org.

Which is why we among others like Cloudflares Ethereum Gateway service has decided to go with
this approach.

## Try it for free

* free argo tunnels
* free workers with worker.dev

https://ethereum-worker.8bitlabs.workers.dev

```
$ curl -d '{"method":"web3_clientVersion","params":[],"id":1,"jsonrpc":"2.0"}' https://ethereum-worker.8bitlabs.workers.dev
```

[1]: https://cloudflare-eth.com
