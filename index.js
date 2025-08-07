import { indexers } from './config.js';
import { die, sleep } from './utils.js';
import { readFile, writeFile, } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getApplicationAddress } from 'algosdk';
import { existsSync, mkdirSync } from 'fs';

const PREFIX_LEN = 3;

const __dirname = dirname(fileURLToPath(import.meta.url));

const network = process.env.NETWORK ?? 'voitestnet';

const indexer = indexers[network];

function makeLatestPath() {
  return join(
    __dirname,
    `data/${network}/latest.json`,
  );
}

function makeFilePath(prefix) {
  prefix = prefix.split("").join("/") 
  return join(
    __dirname,
    `data/${network}/data/${prefix}.json`,
  );
}

console.log('network', network);

async function createLatest() {
  const template = {
    latestRound: 0,
    latestApp: 0,
  };

  await writeFile(
    makeLatestPath(),
    JSON.stringify(template),
  );

  return template;
}

async function loadLatest() {
  try {
    const data = JSON.parse(await readFile(makeLatestPath()));
    if (!data.latestRound) {
      throw new Error('a');
    }
    return data;
  } catch(e) {
    console.warn('Starting from zero');
    return createLatest();
  }
}

async function saveLatest() {
  return writeFile(
    makeLatestPath(),
    JSON.stringify({ latestRound, latestApp }),
  );
}

async function appendFile(prefix, data) {
  let contents = {};
  try {
    contents = JSON.parse(await readFile(makeFilePath(prefix)));
  } catch(e) {
  }
  const nextContents = {
    ...contents,
    ...data,
  };
  const filePath = makeFilePath(prefix)
  const dirPath = dirname(filePath)
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
  await writeFile(
    filePath,
    JSON.stringify(nextContents),
  );
}

let { latestRound, latestApp } = await loadLatest();

console.log('Starting with', { latestRound, latestApp });

let lastNumberOfApps = 1;
let totalApps = 0;

async function fetchApps(next, limit = 1_000, tries = 0) {
  try {
    const q = indexer.searchForApplications().limit(limit);
    if (next)
      q.nextToken(next);
    
    const res = await q.do();
    return res
  } catch(e) {
    console.error(`Try ${tries}: ${e.message}`);
    tries++
    if (tries > 5)
      throw new Error(e.message)
    const delay = Math.min(Math.pow(tries, 2) * 2000, 90_000);
    console.error('Sleeping', delay);
    await sleep(delay);
    return fetchApps(next, limit, tries);
  }
}

async function processApps(applications) {
  const addrs = {};
  for(const { id } of applications) {
    addrs[getApplicationAddress(id)] = id;
  }
  
  const groups = Object.entries(addrs).reduce((grps, [addr, id]) => {
    const pref = addr.slice(0, PREFIX_LEN);
    grps[pref] = grps[pref] ?? [];
    grps[pref].push([addr, id]);
    return grps;
  }, {});

  await Promise.all(
    Object.entries(groups).flatMap(async ([prefix, apps]) => {
      const file = Object.fromEntries(apps);
      return appendFile(prefix, file);
    })
  );
}

async function step() {
  console.time('Fetch');
  const { applications, "next-token": next, "current-round": nextLatestRound, ...r } = await fetchApps(latestApp);
  console.timeEnd('Fetch');
  latestRound = nextLatestRound;

  latestApp = applications.length ? applications[applications.length - 1].id : latestApp;
  lastNumberOfApps = applications.length;
  totalApps += applications.length;

  console.log('Fetched', { r: latestRound, lastApp: latestApp, lastGot: lastNumberOfApps, tot: totalApps });
  await Promise.all([
    processApps(applications),
  ]);
  await saveLatest();
}

while(lastNumberOfApps) {
  console.time('Step');
  await step();
  console.timeEnd('Step');
  await sleep(1500);
}
