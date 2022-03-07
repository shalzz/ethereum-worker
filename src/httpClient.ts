/**
 * HttpClient is a convience wrapper for doing common transforms,
 * such as injecting authentication headers, to fetch requests.
 */
export class HttpClient {
  private readonly url: URL
  private readonly init: RequestInit
  private readonly cache: Cache

  /**
   * Creates a new HttpClient.
   *
   * @param url required, the base url of all requests.
   * @param init initializer for requests, defaults to empty.
   * @param cache cache storage for requests, defaults to global.
   */
  constructor(url: URL, init?: RequestInit, cache?: Cache) {
    if (!url) throw new TypeError('url is a required argument')
    this.url = url

    this.init = init || {}
    if (!this.init.headers) this.init.headers = {}

    this.cache = cache || (<any>caches).default
  }

  /**
   * Fetch a web3 request with id `1` to maximise cache hits.
   *
   * @param path required, the path to fetch, joined by the client url.
   * @param body required, web3 post request body with id
   * @param init initializer for the request, recursively merges with client initializer.
   * @param cacheTtl number of seconds to cache the response.
   * @param staleTtl number of seconds to serve the response stale.
   */
  public async fetchWeb3(
    path: string,
    body: any,
    cacheTtl?: number,
    staleTtl?: number,
    init?: RequestInit,
  ): Promise<Response> {

    // Store the original id from the request
    // and replace it with a const id
    const id = body.id;
    const method = body.method;
    const params = body.params;

    body.id = 1;

    let cacheHeader;
    let defaultBlock;
    let isWriteRequest = false;

    switch (method) {
      case "eth_sendRawTransaction":
        isWriteRequest = true;
        break;
      // Should always be from the latest block
      case "eth_blockNumber":
      case "eth_estimateGas":
        defaultBlock = "latest";
        break;
      // Extract the blocknumber / label
      case "eth_getBalance":
      case "eth_getCode":
      case "eth_getTransactionCount":
      case "eth_getBalance":
      case "eth_call":
        defaultBlock = params[1];
        break;
      case "eth_getStorageAt":
        defaultBlock = params[2];
        break;
    };

    switch (defaultBlock) {
      case "earliest":
      case "latest":
      case "pending":
        cacheHeader = this.cacheHeader(-1, -1);
        break;
      default:
        cacheHeader = this.cacheHeader(cacheTtl, staleTtl);
    };

    // TODO: add a way to revalidate in case of a chain re-org.
    let response = await this.fetch(
      path,
      cacheHeader,
      Object.assign({ body: JSON.stringify(body) }, init || {}),
    )

    // Restore the id to the response object
    let resBody = await response.json();
    resBody.id = id;

    return new Response(JSON.stringify(resBody), response);
  }

  /**
   * Fetch a path from the origin or cache.
   *
   * @param path required, the path to fetch, joined by the client url.
   * @param init initializer for the request, recursively merges with client initializer.
   */
  public async fetch(
    path: string,
    cacheHeader: string,
    init?: RequestInit,
  ): Promise<Response> {
    const key = await this.cacheKey(path, init)

    var response = await this.cache.match(key, { ignoreMethod: true })
    if (!response) {
      response = await this.fetchOrigin(path, init)

      response.headers.set(
        'Cache-control',
        cacheHeader,
      )
      await this.cache.put(key, response.clone())
    }

    return response
  }

  /**
   * Fetch a path directly from the origin.
   *
   * @param path required, the path to fetch, joined by the client url.
   * @param init initializer for the request, recursively merges with client initializer.
   */
  private async fetchOrigin(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    path = new URL(this.url.toString() + path).toString()
    init = this.initMerge(init)

    var response = await fetch(path, init)

    // FIXME: access sometimes redirects to a 200 login page when client credentials are invalid.
    if (
      response.redirected &&
      new URL(response.url).hostname.endsWith('cloudflareaccess.com')
    ) {
      return new Response(
        'client credentials rejected by cloudflare access',
        response,
      )
    }

    return new Response(response.body, response)
  }

  /**
   * Creates a new RequestInit for requests.
   *
   * @param init the initializer to merge into the client initializer.
   */
  private initMerge(init?: RequestInit): RequestInit {
    init = Object.assign({ headers: {} }, init || {})

    for (var kv of Object.entries(this.init.headers)) {
      init.headers[kv[0]] = kv[1]
    }

    return Object.assign(init, this.init)
  }

  /**
   * Creates a cache key for a Request.
   *
   * @param path required, the resource path of the request.
   * @param init the initializer for the request, defaults to empty.
   */
  private async cacheKey(path: string, init?: RequestInit): Promise<Request> {
    path = new URL(path, this.url).toString()
    init = this.initMerge(init)

    if (init.method != 'POST') return new Request(path, init)

    const hash = await sha256(init.body)
    return new Request(`${path}/_/${hash}`, {
      method: 'GET',
      headers: init.headers,
    })
  }

  /**
   * Creates a Cache-control header for a Response.
   *
   * @param cacheTtl required, number of seconds to cache the response.
   * @param staleTtl required, number of seconds to serve the response stale.
   */
  private cacheHeader(cacheTtl?: number, staleTtl?: number): string {
    var cache = 'public'

    if (!cacheTtl || !staleTtl) return cache;
    if (cacheTtl < 0 && staleTtl < 0) cache = 'no-store'
    if (cacheTtl >= 0) cache += `, max-age=${cacheTtl}`
    if (staleTtl >= 0) cache += `, stale-while-revalidate=${staleTtl}`

    return cache
  }
}

/**
 * Generate a SHA-256 hash of any object.
 *
 * @param object the object to generate a hash.
 */
async function sha256(object: any): Promise<string> {
  const buffer = new TextEncoder().encode(JSON.stringify(object))
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
}
