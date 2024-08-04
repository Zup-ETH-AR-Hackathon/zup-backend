import { apiRequest } from '../utils/api.utils.mjs';
import { isAfterOrEqualsMidday } from '../utils/day.utils.mjs';
import { calculateAPR } from '../utils/fees.utils.mjs';

const { THE_GRAPH_API_KEY } = process.env;
const NURI_URL = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/subgraphs/id/Eqr2CueSusTohoTsXCiQgQbaApjuK2ikFvpqkVTPo1y5`;
export async function nuriQueryLast24HsPools({ tokenA, tokenB }) {
  const lastDayQuery = ({ tokenA, tokenB, isAfterMidday }) => `
    query {
      pools(
        where: {
          token0_: { id: "${tokenA}"},
          token1_: {id: "${tokenB}"}
        }
      ) {
        initialFeeTier
        poolDayData(
          orderBy: date,
          orderDirection: desc,
          first: 1
          ${!isAfterMidday ? 'skip: 1' : ''}
        ) {
          id
          tvlUSD
          feesUSD
        }
      }
    }
  `;

  const isAfterMidday = await isAfterOrEqualsMidday();
  const response = await apiRequest({
    queryURL: NURI_URL,
    tokensQuery: lastDayQuery({ tokenA, tokenB, isAfterMidday }),
  });

  return response?.data?.pools?.map(item => {
    const { id, feesUSD, tvlUSD } = item.poolDayData[0];
    const poolId = id.split('-')[0];
    const initialFeeTier = item.initialFeeTier;
    return { poolId, apr: calculateAPR(feesUSD, tvlUSD), initialFeeTier };
  });
}

export async function nuriQueryLast90DaysPools({ tokenA, tokenB }) {
  const lastDaysQuery = ({ tokenA, tokenB, numberOfDays }) => `
    query {
      pools(
        where: {
          token0_: { id: "${tokenA}"},
          token1_: {id: "${tokenB}"}
        }
      ) {
        initialFeeTier
        poolDayData(
          orderBy: date,
          orderDirection: desc,
          first: ${numberOfDays}
        ) {
          id
          tvlUSD
          feesUSD
        }
      }
    }
  `;

  const response = await apiRequest({
    queryURL: NURI_URL,
    tokensQuery: lastDaysQuery({ tokenA, tokenB, numberOfDays: 90 }),
  });

  return response?.data?.pools?.map(item => {
    const { id, feesUSD, tvlUSD } = item.poolDayData[0];
    const poolId = id.split('-')[0];
    const initialFeeTier = item.initialFeeTier;
    return { poolId, apr: calculateAPR(feesUSD, tvlUSD), initialFeeTier };
  }) || [];
}
