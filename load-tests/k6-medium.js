import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://alignaa.org';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export const options = {
  scenarios: {
    medium_mix: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 80 },
        { duration: '4m', target: 200 },
        { duration: '2m', target: 80 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1200', 'p(99)<2000'],
  },
};

const commonHeaders = AUTH_TOKEN
  ? { Authorization: `Bearer ${AUTH_TOKEN}` }
  : {};

export default function () {
  const health = http.get(`${BASE_URL}/api/`);
  check(health, { 'api root ok': (r) => r.status === 200 });

  const me = http.get(`${BASE_URL}/api/auth/me`, { headers: commonHeaders });
  check(me, { 'auth me reachable': (r) => [200, 401].includes(r.status) });

  const goals = http.get(`${BASE_URL}/api/goals`, { headers: commonHeaders });
  check(goals, { 'goals reachable': (r) => [200, 401].includes(r.status) });

  const streak = http.get(`${BASE_URL}/api/progress/streak`, { headers: commonHeaders });
  check(streak, { 'streak reachable': (r) => [200, 401].includes(r.status) });

  sleep(Math.random() * 1.5 + 0.5);
}
