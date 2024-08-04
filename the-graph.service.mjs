import { izumiQueryLast24HsPools } from './scroll-subgraph/izumi.query.mjs';
import { nuriQueryLast24HsPools } from './scroll-subgraph/nuri.query.mjs';
import { getBestAPRPool } from './utils/fees.utils.mjs';

export async function queryBestPools({ tokenA, tokenB }) {
  tokenA = tokenA.toLowerCase();
  tokenB = tokenB.toLowerCase();
  const [
    nuri_A_B_24hs,
    nuri_B_A_24hs,
    // [nuri_A_B_30d, nuri_A_B_90d],
    // [nuri_B_A_30d, nuri_B_A_90d],
    izumi_A_B_24hs,
    izumi_B_A_24hs,
  ] = await Promise.all([
    nuriQueryLast24HsPools({ tokenA, tokenB }),
    nuriQueryLast24HsPools({ tokenA: tokenB, tokenB: tokenA }),
    // nuriQueryLast90DaysPools({ tokenA, tokenB }),
    // nuriQueryLast90DaysPools({ tokenA: tokenB, tokenB: tokenA }),
    izumiQueryLast24HsPools({ tokenA, tokenB }),
    izumiQueryLast24HsPools({ tokenA: tokenB, tokenB: tokenA }),
  ]);
  return {
    nuri_24hs: {
      name: 'Nuri Exchange',
      ...getBestAPRPool([...nuri_A_B_24hs, ...nuri_B_A_24hs]),
    },
    izumi_24hs: {
      name: 'iZUMI Finance',
      ...getBestAPRPool([...izumi_A_B_24hs, ...izumi_B_A_24hs]),
    },
  };
}
