export function calculateAPR(feesUSD, tvlUSD) {
  return parseFloat(
    parseFloat((parseFloat(feesUSD) / parseFloat(tvlUSD)) * 100 * 365).toFixed(
      2
    )
  );
}

export function getBestAPRPool(pools) {
  return pools.reduce((bestPool, currentPool) => {
    return currentPool.apr > bestPool.apr ? currentPool : bestPool;
  });
}
