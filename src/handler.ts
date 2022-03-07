import { HttpClient } from './httpClient';

/**
 * Fetch and log a request
 * @param {Request} request
 */
export async function handleRequest(request: Request) {
  const redirectLocation = 'https://github.com/shalzz/ethereum-worker';
  const url = new URL(ORIGIN_URL);
  const headers = new Headers();
  headers.append('content-type', 'application/json;charset=UTF-8');
  const allowedMethods = [
    'web3_clientVersion',
    'web3_sha3',
    'net_version',
    'net_peerCount',
    'net_listening',
    'eth_chainId',
    'eth_protocolVersion',
    'eth_syncing',
    'eth_mining',
    'eth_hashrate',
    'eth_gasPrice',
    'eth_accounts',
    'eth_blockNumber',
    'eth_getBalance',
    'eth_getStorageAt',
    'eth_getTransactionCount',
    'eth_getBlockTransactionCountByHash',
    'eth_getBlockTransactionCountByNumber',
    'eth_getUncleCountByBlockHash',
    'eth_getUncleCountByBlockNumber',
    'eth_getCode',
    'eth_sendRawTransaction',
    'eth_call',
    'eth_estimateGas',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_getTransactionByHash',
    'eth_getTransactionByBlockHashAndIndex',
    'eth_getTransactionByBlockNumberAndIndex',
    'eth_getTransactionReceipt',
    'eth_pendingTransactions',
    'eth_getUncleByBlockHashAndIndex',
    'eth_getUncleByBlockNumberAndIndex',
    'eth_getLogs',
    'eth_getWork',
    'eth_submitWork',
    'eth_submitHashrate',
    'eth_getProof',
  ];

  const httpClient = new HttpClient(url, <RequestInit>{
    method: 'POST',
    headers: headers,
    keepalive: true,
    cf: {
      cacheEverything: true,
    },
  });

  if (request.method != "POST") {
    return Response.redirect(redirectLocation, 301);
  }

  const body = await request.json();

  if (!body.method || !allowedMethods.includes(body.method)) {
    let response = {
      id: body.id,
      jsonrpc:"2.0",
      error:{"code":-32601,"message":`The method ${body.method} does not exist/is not available`}
    }
    return new Response(JSON.stringify(response), { status: 200 });
  }

  // Cache for 7 days (604800) and serve stale content for 1 min.
  return httpClient.fetchWeb3('', body, 604800, 60);
}
