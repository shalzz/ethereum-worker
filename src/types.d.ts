import { KVNamespace } from '@cloudflare/workers-types'

declare global {
  const myKVNamespace: KVNamespace
  const ORIGIN_URL;
  const WRITE_URL;
}
