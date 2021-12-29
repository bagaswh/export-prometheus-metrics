module.exports = {
  queries: [
    {
      query:
        '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node",mode="idle"}[1m])) * 100)',
      name: "cpu_usage",
    },
    {
      query:
        'node_memory_MemTotal_bytes{job="node"} - node_memory_MemFree_bytes{job="node"} - (node_memory_Cached_bytes{job="node"} + node_memory_Buffers_bytes{job="node"})',
      name: "mem_usage",
    },
    {
      query:
        "100 - ((node_filesystem_avail_bytes{job=\"node\",device!~'rootfs'} * 100) / node_filesystem_size_bytes{job=\"node\",device!~'rootfs'})",
      name: "disk_capacity_usage",
    },
  ],
  commonLabels: {
    cpu_model: "Intel Xeon",
    mem_total: {
      query: 'node_memory_MemTotal_bytes{job="node"}',
    },
    disk_capacity_usage: {
      query: "node_filesystem_size_bytes",
    },
  },
};
