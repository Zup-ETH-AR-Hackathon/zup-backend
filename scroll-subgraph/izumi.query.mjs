const THE_GRAPH_API_KEY = '2a2afdfed659312ad01dea15f69ae058';
const queryURL = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/subgraphs/id/Sxx812XgeKyzQPaBpR5YZWmGV5fZuBaPdh7DFhzSwiQ`;

export async function queryLast24HsPools() {
  const lastDayQuery = `
    query {
      lidoConfigs(first: 5) {
        id
        insuranceFund
        oracle
        treasury
      }
      lidoTransfers(first: 5) {
        id
        from
        to
        value
      }
    }
  `;
}
