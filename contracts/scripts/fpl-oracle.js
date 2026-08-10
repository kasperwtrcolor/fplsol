// This script is executed by the Chainlink Functions Decentralized Oracle Network (DON)
// It fetches the points for a specific FPL manager for a specific gameweek.

const managerId = args[0];
const gameweekId = args[1];

if (!managerId || !gameweekId) {
  throw Error("Missing required arguments: managerId, gameweekId");
}

console.log(`Fetching FPL points for Manager ID ${managerId}, Gameweek ${gameweekId}`);

// The official FPL API endpoint for a manager's gameweek data
const url = `https://fantasy.premierleague.com/api/entry/${managerId}/event/${gameweekId}/picks/`;

// Make the HTTP request
const fplRequest = Functions.makeHttpRequest({
  url: url,
  method: "GET",
});

const fplResponse = await fplRequest;

if (fplResponse.error) {
  console.error(fplResponse.error);
  throw Error("Request failed");
}

// Parse the response
const data = fplResponse.data;

if (!data || !data.entry_history || data.entry_history.points === undefined) {
  throw Error("Unexpected API response structure or missing points data");
}

// Extract the points (this is an integer)
const points = data.entry_history.points;
console.log(`Successfully fetched points: ${points}`);

// Chainlink Functions expects the returned value to be a Buffer.
// We encode the integer points as a uint256.
return Functions.encodeUint256(points);
