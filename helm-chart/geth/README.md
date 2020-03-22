# ethereum

[Ethereum](https://www.ethereum.org/) is a decentralized platform for building applications using blockchain.

## TL;DR;

```console
$ helm install geth .
```

## Introduction

This chart deploys a **public** [Ethereum](https://www.ethereum.org/) network onto
a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.
This network supports connecting to the mainnet and the ropsten testnet by default
but can be easily tweaked to support other public networks, and for further information
on running another network, refer to [Geth's documentation](https://geth.ethereum.org/docs/interface/command-line-options).

## Prerequisites

* Kubernetes 1.8
* Helm 3.x

## Installing the Chart

2. Install the chart as follows:

    ```console
    $ helm install --name my-release .
    ```

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
$ helm uninstall my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the vault chart and their default values.

| Parameter                         | Description                                   | Default                               |
|-----------------------------------|-----------------------------------------------|---------------------------------------|
| `imagePullPolicy`                 | Container pull policy                         | `IfNotPresent`                        |
| `nodeSelector`                    | Node labels for pod assignmen                 |                                       |
| `geth.image.repository`           | geth container image to use                   | `ethereum/client-go`                  |
| `geth.image.tag`                  | geth container image tag to deploy            | `v1.7.3`                              |
| `geth.tx.replicaCount`            | geth transaction nodes replica count          | `2`                                   |
| `geth.tx.service.type`            | k8s service type for geth transaction nodes   | `ClusterIP`                           |
| `geth.tx.args.rpcapi`             | APIs offered over the HTTP-RPC interface      | `eth,net,web3`                        |
| `geth.genesis.networkId`          | Ethereum network id                           | `98052`                               |
| `geth.genesis.difficulty`         | Ethereum network difficulty                   | `0x0400`                              |
| `geth.genesis.gasLimit`           | Ethereum network gas limit                    | `0x8000000`                         |

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example, to configure the networkid:

```console
$ helm install geth --set geth.genesis.networkid=98052 .
```

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example,

```console
$ helm install geth -f values.yaml .
```

