import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const promptEnhancementCalls = new Counter('prompt_enhancements');
const failedCalls = new Counter('failed_calls');
const enhancementTime = new Trend('enhancement_time');
const failRate = new Rate('fail_rate');

export const options = {
  // Test execution options
  stages: [
    { duration: '30s', target: 5 },    // Ramp up to 5 users
    { duration: '1m', target: 10 },    // Ramp up to 10 users
    { duration: '3m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 20 },   // Ramp up to 20 users for a stress test
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],

  // Success criteria
  thresholds: {
    // 95% of requests must complete below 2000ms
    http_req_duration: ['p(95)<2000'],

    // Less than 1% of requests should fail
    'fail_rate': ['rate<0.01'],

    // Prometheus-compatible output metrics
    'http_reqs': ['count>100'],
  },
};

export default function () {
  // URL and authentication setup
  const baseUrl = __ENV.API_URL || 'http://localhost:5000/v1';
  const apiKey = __ENV.API_KEY || 'test_api_key';

  // Test data - using an array of different prompts to avoid caching effects
  const prompts = [
    'Write about performance testing APIs',
    'Explain how to build a scalable API',
    'Describe REST API design principles',
    'How to optimize database queries',
    'What are microservices?',
    'Explain API authentication methods',
    'What is API rate limiting?',
    'How to implement API versioning',
    'Discuss API documentation best practices',
    'What are webhooks and how do they work?'
  ];

  // Select a random prompt from the array
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  // Set request parameters
  const url = `${baseUrl}/prompts`;
  const payload = JSON.stringify({
    text: randomPrompt,
    format: 'structured'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    tags: { name: 'EnhancePromptRequest' }
  };

  // Send the request and measure time
  const startTime = new Date().getTime();
  const res = http.post(url, payload, params);
  const endTime = new Date().getTime();

  // Track the call
  promptEnhancementCalls.add(1);
  enhancementTime.add(endTime - startTime);

  // Check if the response is successful
  const success = check(res, {
    'is status 200': (r) => r.status === 200,
    'has valid id': (r) => JSON.parse(r.body).id !== undefined,
    'has enhanced text': (r) => {
      const body = JSON.parse(r.body);
      return body.enhancedText && body.enhancedText.length > 0;
    }
  });

  // Track failed calls
  if (!success) {
    failedCalls.add(1);
    failRate.add(1);
    console.log(`Failed request: ${res.status} - ${res.body}`);
  } else {
    failRate.add(0);
  }

  // Add a sleep time between requests to simulate real user behavior
  // Adjust the sleep time based on your expected user behavior
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Helper functions
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
    'summary.html': htmlSummary(data),
  };
}

function htmlSummary(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>AI Prompt Enhancer API Load Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .metric { margin-bottom: 20px; }
    .metric h2 { color: #555; }
    .status-ok { color: green; }
    .status-fail { color: red; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1> AI Prompt Enhancer API Load Test Results</h1>
  
  <div class="metric">
    <h2>Summary</h2>
    <p>Test Run: ${new Date(data.timestamp).toISOString()}</p>
    <p>Total Requests: ${data.metrics.http_reqs.values.count}</p>
    <p>Failed Requests: ${data.metrics.failed_calls ? data.metrics.failed_calls.values.count : 0}</p>
    <p>Avg. Response Time: ${(data.metrics.http_req_duration.values.avg / 1000).toFixed(2)}s</p>
  </div>
  
  <div class="metric">
    <h2>Response Time (ms)</h2>
    <table>
      <tr>
        <th>Min</th>
        <th>Max</th>
        <th>Avg</th>
        <th>p(90)</th>
        <th>p(95)</th>
        <th>p(99)</th>
      </tr>
      <tr>
        <td>${data.metrics.http_req_duration.values.min.toFixed(2)}</td>
        <td>${data.metrics.http_req_duration.values.max.toFixed(2)}</td>
        <td>${data.metrics.http_req_duration.values.avg.toFixed(2)}</td>
        <td>${data.metrics.http_req_duration.values["p(90)"].toFixed(2)}</td>
        <td>${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}</td>
        <td>${data.metrics.http_req_duration.values["p(99)"].toFixed(2)}</td>
      </tr>
    </table>
  </div>
  
  <div class="metric">
    <h2>Threshold Results</h2>
    <table>
      <tr>
        <th>Threshold</th>
        <th>Result</th>
      </tr>
      ${Object.entries(data.metrics)
      .filter(([_, m]) => m.thresholds)
      .map(([name, metric]) => {
        return Object.entries(metric.thresholds)
          .map(([thresholdName, threshold]) => {
            return `
                <tr>
                  <td>${name}: ${thresholdName}</td>
                  <td class="status-${threshold.ok ? 'ok' : 'fail'}">${threshold.ok ? 'PASSED' : 'FAILED'}</td>
                </tr>
              `;
          })
          .join('');
      })
      .join('')
    }
    </table>
  </div>
</body>
</html>
  `;
}

function textSummary(data, options) {
  const { metrics, timestamp } = data;
  const { http_req_duration, http_reqs, prompt_enhancements, failed_calls, fail_rate } = metrics;

  const out = [];
  out.push(`Test run completed at: ${new Date(timestamp).toISOString()}`);
  out.push(`Summary:`);
  out.push(`  Total requests:        ${http_reqs.values.count}`);
  out.push(`  Prompt enhancements:   ${prompt_enhancements ? prompt_enhancements.values.count : 0}`);
  out.push(`  Failed calls:          ${failed_calls ? failed_calls.values.count : 0}`);
  out.push(`  Failure rate:          ${fail_rate ? (fail_rate.values.rate * 100).toFixed(2) + '%' : '0%'}`);
  out.push(``);
  out.push(`Response time (ms):`);
  out.push(`  min:                   ${http_req_duration.values.min.toFixed(2)}`);
  out.push(`  avg:                   ${http_req_duration.values.avg.toFixed(2)}`);
  out.push(`  max:                   ${http_req_duration.values.max.toFixed(2)}`);
  out.push(`  p(90):                 ${http_req_duration.values["p(90)"].toFixed(2)}`);
  out.push(`  p(95):                 ${http_req_duration.values["p(95)"].toFixed(2)}`);
  out.push(`  p(99):                 ${http_req_duration.values["p(99)"].toFixed(2)}`);

  return out.join('\n');
}