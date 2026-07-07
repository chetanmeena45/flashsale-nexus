import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// ---- Custom metrics ----
const rateLimited429 = new Counter('rate_limited_429_total');
const rateLimitCorrectBody = new Rate('rate_limit_body_correct');

// ---- Config ----
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const PRODUCT_ID = __ENV.PRODUCT_ID || 'SKU-1001';

// 10 unique users -> 10 unique Authorization tokens.
// Bucket4j keys off this header string, so each token has its own 5 req/min bucket.
const TOKENS = Array.from({ length: 10 }, (_, i) => `Bearer user-token-${i + 1}`);

// Spike profile: 0 -> 50 concurrent VUs over 10s, hold briefly, then ramp down.
// Since there are only 10 tokens, VUs cycle through them (5 VUs share a token on average),
// which is exactly what's needed to blow past the 5 req/min limit per token fast.
export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50 }, // spike: 0 -> 50 concurrent
        { duration: '10s', target: 50 }, // hold at peak to guarantee limit is hit
        { duration: '5s', target: 0 },   // ramp down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // Sanity guard: fail the test run if the API never actually triggers a 429.
    'rate_limited_429_total': ['count>0'],
    'http_req_duration': ['p(95)<1000'],
  },
};

export default function () {
  // Assign a token deterministically per VU so a given VU always hits the same bucket,
  // making it easy to trip that specific token's 5-req/min limit.
  const token = TOKENS[__VU % TOKENS.length];

  const res = http.post(
    `${BASE_URL}/api/order/purchase/${PRODUCT_ID}`,
    null,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      tags: { name: 'PurchaseEndpoint' },
    }
  );

  const is429 = res.status === 429;
  const bodyHasMessage = res.body && res.body.includes('Too Many Requests');

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'when limited, status is exactly 429': (r) => !is429 || r.status === 429,
    'when limited, body contains "Too Many Requests"': (r) => !is429 || bodyHasMessage,
  });

  if (is429) {
    rateLimited429.add(1);
    rateLimitCorrectBody.add(bodyHasMessage ? 1 : 0);
  }

  // Small jitter so all 50 VUs aren't in lockstep on every iteration
  sleep(Math.random() * 0.3);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(data, null, 2),
  };
}