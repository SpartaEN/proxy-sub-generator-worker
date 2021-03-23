# proxy-sub-generator-worker

## Supported subscription types

- SSPanel ShadowsocksR (sub=1)

## Usage

Copy `wrangler.sample.toml` to `wrangler.toml` and setup basic infomation

Setup KV keys as follow

| Key  | Value  | Description           |
|------|--------|-----------------------|
| BL   | 0      | Toggle Blacklist(0/1) |
| BLKW | []     | Keywords (JSON Array of base64 encoded string) |
| WL   | 0      | Toggle Whitelist(0/1) |
| WLKW | []     | Keywords (JSON Array of base64 encoded string) |
| KEY  | keystr | Key to access the subscription |
| URL  | https://example.com/subs/aaabbccddd | Upstream subscription URL without query string |

Deploy

```
wrangler deploy
```

Access

`https://your-project.your-username.workers.dev/<KEY>?subs=1`