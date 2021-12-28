# export-prometheus-metrics

## Usage

```bash
node index.js -u http://demo.robustperception.io:9090 -q '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node",mode="idle"}[1m])) * 100)'
```
