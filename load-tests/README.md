# Medium Traffic Capacity Check

This test targets a medium launch profile (up to ~200 concurrent users).

## Prerequisites

- Install [k6](https://k6.io/docs/get-started/installation/).
- Use a valid auth token if you want authenticated endpoint coverage.

## Run

```bash
k6 run load-tests/k6-medium.js -e BASE_URL=https://alignaa.org
```

Authenticated run:

```bash
k6 run load-tests/k6-medium.js -e BASE_URL=https://alignaa.org -e AUTH_TOKEN=<session_token>
```

## What to watch

- `http_req_failed` should stay below 2%.
- `http_req_duration` should stay under:
  - `p95 < 1200ms`
  - `p99 < 2000ms`
- Watch backend logs for spikes in 429/5xx, Mongo timeouts, and OAuth callback failures.
