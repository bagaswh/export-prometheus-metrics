const Axios = require("axios").default.Axios;
const csv = require("csv-writer");
const fs = require("fs");
const { program } = require("commander");

program
  .option("-u, --prometheus-url <url>", "URL of Prometheus server")
  .option("-q, --query <query>", "Query")
  .option("-n, --query-name <queryName>", "Name the query to be shown in CSV");
program.parse(process.argv);

let options = program.opts();
options.queryName = options.queryName || options.query;

let config = "{}";
try {
  config = fs.readFileSync("./export.config.json", "utf-8");
} catch (err) {}
config = JSON.parse(config);

const axios = new Axios({
  baseURL: options.prometheusUrl,
});

async function query(query, options = {}) {
  const now = Date.now() / 1000;
  const res = await axios.get(`api/v1/query_range`, {
    ...options,
    params: {
      query,
      start: now - 100,
      end: now,
      step: 14,
    },
  });
  return JSON.parse(res.data).data;
}

(async () => {
  const prometheusData = await query(options.query);
  const metric = prometheusData.result[0].metric;
  const values = prometheusData.result[0].values;
  const csvWriter = csv.createObjectCsvWriter({
    path: "out.csv",
    header: [
      { id: "query", title: "query" },
      { id: "timestamp", title: "timestamp" },
      { id: "value", title: "value" },
      ...Object.keys(metric).map((key) => ({
        id: key,
        title: key,
      })),
      ...(config.additionalData || []).map((item) => ({
        id: item.key,
        title: item.key,
      })),
    ],
  });
  const data = values.map((item) => {
    const obj = {
      query: options.queryName,
      timestamp: item[0],
      value: item[1],
    };
    Object.keys(metric).forEach((key) => {
      obj[key] = metric[key];
    });
    (config.additionalData || []).forEach((item) => {
      obj[item.key] = item.value;
    });
    return obj;
  });
  csvWriter.writeRecords(data);
})();
