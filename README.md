# export-prometheus-metrics

## Usage

```bash
node index.js -u http://demo.robustperception.io:9090 -q '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node",mode="idle"}[1m])) * 100)' -d 100
```

Output:

```json
{
  "commonLabels": {
    "cpu_model": "Intel Xeon",
    "mem_total": "2097152000",
    "disk_capacity_usage": "41442127872"
  },
  "metrics": {
    "cpu_usage": [
      {
        "timestamp": 1640743352.411,
        "value": "37.07999999821187",
        "instance": "demo.robustperception.io:9100"
      }
    ],
    "mem_usage": [
      {
        "timestamp": 1640743352.411,
        "value": "783663104",
        "instance": "demo.robustperception.io:9100",
        "job": "node"
      }
    ],
    "disk_capacity_usage": [
      {
        "timestamp": 1640743352.411,
        "value": "36.86604089246704",
        "device": "/dev/vda1",
        "fstype": "ext4",
        "instance": "demo.robustperception.io:9100",
        "job": "node",
        "mountpoint": "/"
      }
    ]
  }
}
```

You can also define your queries in export.config.js (refer to export.config.example.js for config example).

Ugly code.
