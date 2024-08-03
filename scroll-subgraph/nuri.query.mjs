import { apiRequest } from '../utils/api.utils.mjs';
import { isAfterOrEqualsMidday } from '../utils/day.utils.mjs';
import { calculateAPR } from '../utils/fees.utils.mjs';

const { THE_GRAPH_API_KEY } = process.env;
const NURI_URL = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/subgraphs/id/Eqr2CueSusTohoTsXCiQgQbaApjuK2ikFvpqkVTPo1y5`;
export async function queryLast24HsPools({ tokenA, tokenB }) {
  const lastDayQuery = ({ tokenA, tokenB, isAfterMidday }) => `
    query {
      pools(
        where: {
          token0_: { id: "${tokenA}"},
          token1_: {id: "${tokenB}"}
        }
      ) {
        poolDayData(
          orderBy: date,
          orderDirection: desc,
          first: 1
          ${!isAfterMidday ? 'skip: 1' : ''}
        ) {
          id
          tvlUSD # Last snapshot of the Pool's TVL at date
          feesUSD # Pool's Collected fees since last snapshot
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
    return { poolId, apr: calculateAPR(feesUSD, tvlUSD) };
  });
}
