import fetch from 'node-fetch';

export async function apiRequest({ queryURL, tokensQuery }) {
  //set the request options
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: tokensQuery,
    }),
  };
  //get the response
  const response = await fetch(queryURL, options);
  //parsing the body text as JSON
  return response.json();
}
