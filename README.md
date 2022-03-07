<div align="center">

  <h1>Ethereum worker</h1>
  <strong>Run your own Ethereum node with CDN caching on a Raspberry Pi or the cloud</strong>

</div>

## About

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

Which is why we, among others like Cloudflares Ethereum Gateway service, have decided to go with
this approach.

## Demo

We have a demo worker running that you can use to quickly try out how it works at:
https://ethereum-worker.8bitlabs.workers.dev

For example, query the `web3_clientVersion` using curl
```
$ curl -d '{"method":"web3_clientVersion","params":[],"id":1,"jsonrpc":"2.0"}' https://ethereum-worker.8bitlabs.workers.dev
```

## Try it for free

Cloudflare provides free modes of both the services we will be using.

* [Free Argo tunnels][2]
* [Free workers with worker.dev][3]

## Install

To deploy a Cloudflare worker we need to install the `wrangler` CLI tool from
Cloudflare. Follow the instructions here to [install][4] it on your machine.

Once you have `wrangler` installed, create a Cloudflare account if you haven't already
and configure `wrangler` with your account using

```
wrangler config
```

You'll need to
provide your email associated with your account and your Global API Key.

For help on how to create an API key see this [support article][5].
It is possible to use a scope limited API key for this but it is not well documented
and you will have to do some trial and error to get it working.

Before we can publish our worker to enable us to serve cached responses for the
same kinds of requests we need to specify the `ORIGIN_URL` which points to the server where we have our Ethereum node running.

The `ORIGIN_URL` can be the IP address of our server with the port specified
listening for RPC requests or it can be a load balancer domain name. But with
Cloudflare workers an Argo tunnel is recommended since they work well together
and are optimised for each other with the added benefit of Argo tunnels being cheaper
compare to the prices usually charged by major cloud providers for a load balancer.

If you don't already have a Ethereum client running see [below][6] for helm charts that
can help you get one running. If you have a client running and just want to setup
an Argo tunnel see official docs [here][7].

To change the `ORIGIN_URL` edit the `wrangler.toml` file and specify the URL as an environment variable.

```
vars = { ORIGIN_URL = "https://url-pointing-to-my-ethereum-node.com"}
```

Now we are ready to publish. Make sure we have `workers_dev = true` set so that
we only use the free workers tier plan.

## Write Specific Endpoint

Optionally you can specify a separate endpoint to use for write operations,
for example the flashbots RPC endpoint.

To do so, specify a `WRITE_URL` var in your `wrangler.toml` file

```
vars = { ORIGIN_URL = "https://url-pointing-to-my-ethereum-node.com", WRITE_URL = "https://rpc.flashbots.net" }
```

## Publish

To publish all we need to do now it run the command

```
wrangler publish
```

And if everything went well you should now see a workers.dev URL that you can use
to query your web3 JSON-RPC requests utilizing the CDN and edge computing
capabilities of the Cloudflare network!

## Helm Charts

If you are looking to quickly deploy an Ethereum client with Argo tunnels setup,
we provide Helm Charts for deploying the Ethereum  clients `geth` and `parity`
to a Kubernetes clusters with a Argo tunnel running as a side car model.

See the `helm-chart` folder and chart specific `README.md` for more details.


[1]: https://cloudflare-eth.com
[2]: https://developers.cloudflare.com/argo-tunnel/trycloudflare/
[3]: https://developers.cloudflare.com/workers/quickstart#publish-to-workers-dev
[4]: https://developers.cloudflare.com/workers/tooling/wrangler/install/
[5]: https://support.cloudflare.com/hc/en-us/articles/200167836-Managing-API-Tokens-and-Keys
[6]: #helm-charts
[7]: https://developers.cloudflare.com/argo-tunnel/quickstart/
