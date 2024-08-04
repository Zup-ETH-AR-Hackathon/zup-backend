import { apiRequest } from '../utils/api.utils.mjs';
import { calculateAPR } from '../utils/fees.utils.mjs';

const IZUMI_URL =
  'https://graph-node-api.izumi.finance/query/subgraphs/name/izi-swap-scroll';

export async function queryPoolData({ tokenA, tokenB }) {
  const poolDataQuery = ({ tokenA, tokenB }) => `
    query { 
      pools(
        where: { 
          tokenX_: { id: "${tokenA}" }, 
          tokenY_: { id: "${tokenB}" }
        }
      ) {
        id
        feeTier
      }
    }`;

  const response = await apiRequest({
    queryURL: IZUMI_URL,
    tokensQuery: poolDataQuery({ tokenA, tokenB }),
  });

  return response?.data?.pools?.reduce((acc, item) => {
    acc[item.id] = {
      id: item.id,
      feeTier: item.feeTier,
    };
    return acc;
  }, {});
}

export async function izumiQueryLast24HsPools({ tokenA, tokenB }) {
  const poolsData = await queryPoolData({ tokenA, tokenB });
  const poolIds = Object.keys(poolsData).join('","');
  const poolQuery = `["${poolIds}"]`;
  const lastDayQuery = `
    query {
      poolHourDatas(
        where: {
          pool_: {
            id_in: ${poolQuery}
          }
        },
        first: 24
        orderBy: hourStartUnix
        orderDirection: desc
      ) {
        id
        tvlUSD
        feesUSD
      }
    }
  `;

  const response = await apiRequest({
    queryURL: IZUMI_URL,
    tokensQuery: lastDayQuery,
  });

  const poolsWithAPR =
    response?.data?.poolHourDatas?.map(({ id, feesUSD, tvlUSD }) => {
      const poolId = id.split('-')[0];
      const initialFeeTier = poolsData[poolId].feeTier;
      return { poolId, apr: calculateAPR(feesUSD, tvlUSD), initialFeeTier };
    }) || [];

  if (!poolsWithAPR.length) return [];

  // Step 1: Create a map to store the poolId and corresponding items
  const poolMap = new Map();

  poolsWithAPR.forEach(item => {
    if (!poolMap.has(item.poolId)) {
      poolMap.set(item.poolId, []);
    }
    poolMap.get(item.poolId).push(item);
  });

  // Step 2: Calculate the sum of APRs for each poolId
  const summarizedInfo = [];

  poolMap.forEach((items, poolId) => {
    const totalApr = items.reduce((sum, item) => sum + item.apr, 0);
    summarizedInfo.push({
      poolId: poolId,
      apr: totalApr,
      initialFeeTier: items[0].initialFeeTier, // Assuming initialFeeTier is the same for all items of the same poolId
    });
  });

  return summarizedInfo;
}
