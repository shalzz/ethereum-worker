import { HttpClient } from './httpClient'

/**
 * Fetch and log a request
 * @param {Request} request
 */
export async function handleRequest(request: Request) {

  const redirectLocation = "https://neuraljoint.com"
  const url = new URL("https://compensation-wrestling-golf-idle.trycloudflare.com");
  const headers = new Headers();
  headers.append("content-type", "application/json;charset=UTF-8");

  const httpClient = new HttpClient(url, <RequestInit> {
    method: "POST",
    headers: headers,
    keepalive: true,
    cf: {
        cacheEverything: true
    }
  });

  if (request.method != "POST") {
      return Response.redirect(redirectLocation, 301);
  }

  let body = await request.json();
  console.log(body);

  return httpClient.fetch("/", <RequestInit> {
    body: JSON.stringify(body),
  });
}
