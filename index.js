const axios = require("axios").default;
const csv = require("csv-writer");
const fs = require("fs");
const { program } = require("commander");

program
  .requiredOption("-u, --prometheus-url <url>", "URL of Prometheus server")
  .option("-q, --query <query>", "Query")
  .option("-n, --query-name <queryName>", "Name the query to be shown in CSV")
  .option("-s, --start <start>", "Start time range", Date.now() / 1000)
  .option("-d, --duration <duration>", "Duration range", 3600);
program.parse(process.argv);

let programOptions = program.opts();
programOptions.queryName = programOptions.queryName || programOptions.query;

let config = {};
try {
  config = require("./export.config.example.js");
} catch (err) {
  config = {};
}

const axiosInstance = axios.create({
  baseURL: programOptions.prometheusUrl,
});

async function makeQuery(query, isRange = true, options = {}) {
  const now = Number(programOptions.start);

  const queryPath = isRange ? "query_range" : "query";
  let params = {};
  if (isRange) {
    params = {
      start: now - Number(programOptions.duration),
      end: now,
      step: 14,
    };
  } else {
    params = {
      time: now,
    };
  }
  const res = await axiosInstance.get(`api/v1/${queryPath}`, {
    ...options,
    params: {
      query,
      ...params,
    },
  });
  return res.data.data;
}

class QueryMetricsError extends Error {
  constructor(message, response, query) {
    super(message);
    this.response = response;
    this.query = query;
  }
}

async function getMetricsFromQuery(query, isRange = true) {
  let prometheusData = {};
  try {
    prometheusData = await makeQuery(query, isRange);
  } catch (err) {
    throw new QueryMetricsError(
      "Error querying metrics",
      err.response.data,
      query
    );
  }
  let data = [];
  if (prometheusData.result.length) {
    const metric = prometheusData.result[0].metric;
    let values = prometheusData.result[0][isRange ? "values" : "value"];
    if (!isRange) {
      values = [values];
    }
    data = values.map((value) => {
      const obj = {
        timestamp: value[0],
        value: value[1],
      };
      Object.keys(metric).forEach((key) => {
        obj[key] = metric[key];
      });
      (config.additionalData || []).forEach((item) => {
        obj[item.key] = item.value;
      });
      return obj;
    });
  }
  return data;
}

function isObject(thing) {
  return typeof thing === "object" && !Array.isArray(thing) && thing !== null;
}

(async () => {
  const metrics = {
    commonLabels: {},
    metrics: {},
  };

  for (const labelName in config.commonLabels) {
    const label = config.commonLabels[labelName];
    if (isObject(label)) {
      const metricsFromQuery = await getMetricsFromQuery(label.query, false);
      metrics.commonLabels[labelName] = metricsFromQuery[0]?.value;
    } else if (typeof label == "string") {
      metrics.commonLabels[labelName] = label;
    }
  }

  const queries = [];
  if (programOptions.query) {
    queries.push({
      query: programOptions.query,
      name: programOptions.queryName,
    });
  }
  queries.push(...(config.queries || []));
  for (const queryItem of queries) {
    metrics.metrics[queryItem.name || queryItem.query] =
      await getMetricsFromQuery(queryItem.query);
  }

  console.log(JSON.stringify(metrics));
})();
