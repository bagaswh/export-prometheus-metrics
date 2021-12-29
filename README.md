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
    "mem_total": [
      {
        "timestamp": 1640743239.311,
        "value": "2097152000",
        "__name__": "node_memory_MemTotal_bytes",
        "instance": "demo.robustperception.io:9100",
        "job": "node"
      }
    ],
    "disk_capacity_usage": [
      {
        "timestamp": 1640743239.311,
        "value": "41442127872",
        "__name__": "node_filesystem_size_bytes",
        "device": "/dev/vda1",
        "fstype": "ext4",
        "instance": "demo.robustperception.io:9100",
        "job": "node",
        "mountpoint": "/"
      }
    ]
  },
  "metrics": {
    "cpu_usage": [
      {
        "timestamp": 1640743229.311,
        "value": "38.972441108614134",
        "instance": "demo.robustperception.io:9100"
      }
    ],
    "mem_usage": [
      {
        "timestamp": 1640743229.311,
        "value": "784982016",
        "instance": "demo.robustperception.io:9100",
        "job": "node"
      }
    ],
    "disk_capacity_usage": [
      {
        "timestamp": 1640743229.311,
        "value": "36.859833952495364",
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
