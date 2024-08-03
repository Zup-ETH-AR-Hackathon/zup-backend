import { queryLast24HsPools } from './scroll-subgraph/nuri.query.mjs';
import { getBestAPRPool } from './utils/fees.utils.mjs';

export async function queryBestPools({ tokenA, tokenB }) {
  tokenA = tokenA.toLowerCase();
  tokenB = tokenB.toLowerCase();
  const [nuri_A_B, nuri_B_A] = await Promise.all([
    queryLast24HsPools({ tokenA, tokenB }),
    queryLast24HsPools({ tokenA: tokenB, tokenB: tokenA }),
  ]);
  return { nuri_24hs: getBestAPRPool([...nuri_A_B, ...nuri_B_A]) };
}
