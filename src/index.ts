import { HttpClient } from './httpClient'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request: Request) {

  const url = new URL("https://compensation-wrestling-golf-idle.trycloudflare.com");
  const headers = new Headers(); 

  const httpClient = new HttpClient(url, <RequestInit> {
    headers: headers,
    keepalive: true,
    cf: {
        cacheEverything: true
    }
  });

  const data = {
    result: ['some', 'results'],
    errors: null,
    msg: 'this is some random json',
  };
   
  const body = JSON.stringify(data)
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  })
}
