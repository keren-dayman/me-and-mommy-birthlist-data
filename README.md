# me-and-mommy-birthlist-data

Public data bundle for the **ME & MOMMY** birth-list planning tool.

This repository holds **generated output only**. It is public because GitHub Pages
on a free account can only serve a public repository. Nothing here is written by
hand, and nothing here is private: no customer data, no e-mail addresses, no keys.

The engine that produces these files lives in a separate, private repository.

## The two files

| File | What it is | How to fetch it |
|---|---|---|
| `bl_version.json` | Tiny. Version number, build time, counts, and when each store was last scanned. | Always **uncached**. |
| `bl_data.json` | The catalogue the interface displays: list items, stores, models, prices per store. | Cached, addressed by version. |

Served from:

```
https://keren-dayman.github.io/me-and-mommy-birthlist-data/bl_version.json
https://keren-dayman.github.io/me-and-mommy-birthlist-data/bl_data.json
```

## How to read them (the cache rule)

A CDN caches hard. Fetching `bl_data.json` directly would show yesterday's prices
for hours. So always do two steps:

```js
const BASE = 'https://keren-dayman.github.io/me-and-mommy-birthlist-data/';

// 1. version first, never from cache
const ver = await fetch(BASE + 'bl_version.json?t=' + Date.now(),
                        { cache: 'no-store' }).then(r => r.json());

// 2. data addressed by that version -- safe to cache forever
const data = await fetch(BASE + 'bl_data.json?v=' + ver.v).then(r => r.json());
```

Because step 2's URL changes whenever the data changes, the browser may keep
`bl_data.json` as long as it likes and still never show a stale price.

`bl_version.json` also carries `data.sha256`, so a consumer can verify it got
the file the build actually produced.

## Field names

`bl_data.json` describes its own field names under `legend`. Short keys are used
deliberately: this file is downloaded by every visitor.

## Freshness

`stores[id].d` is when that store was last scanned. Show it next to every price.
A price with no visible date is a complaint waiting to happen.
