export function die(msg) {
  console.error(msg);
  process.exit(1);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
