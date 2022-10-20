const { HubspotClient, TokenCache } = require('./hub');
const ReputationClient = require('./reputation_api');
const ReputationIntegrationConfig = require('./config');

module.exports.upload_summary1 = async (account_id, tenant_id, limit=100) =>{
  console.log("Upload summary1");
  return {
     "sucess": 'true',
     "locations_count": 0,
     "repscore_count": 0
   };
}

module.exports.upload_summary = async (account_id, tenant_id, limit=100) => {
  var refresh_token = null;
  var reputationApiKey = null;
  var access_token = null;

  //console.log("queries:", req.query, account_id, tenant_id);
  if (!account_id || !tenant_id){
     throw new Error("Please provide hubspot account and tenant id to proceed");
  }

  // check whether it is cached by userId - sessionId
  // Get refresh token from configuration if account_id is passed in
  if (account_id){
    access_token = TokenCache.getAccessToken(account_id);
    if (!access_token){
      // Get refresh token in configuration
      refresh_token = ReputationIntegrationConfig.getRefreshToken(account_id);
      console.log("refresh_token:", refresh_token);
      if (refresh_token){
        // refresh token
        access_token = await HubspotClient.refreshAccessToken(account_id, refresh_token);
        console.log("Refreshed: access_token:", access_token);
      }
    }
  }

  if (!access_token){
     // Provide API key
    throw new Error("Unable to get refresh_token to proceed. Please check account id to proceed.");
  }

  if (tenant_id){
    reputationApiKey = ReputationIntegrationConfig.getApiKey(tenant_id);
  }
  if (!reputationApiKey){
     // Provide API key
    throw new Error("Please provide reputation_api_key or tenant (need to configure with API_KEY) to proceed");
  }

  // Update configuration because we tie these two together.
  if (account_id && tenant_id) {
    console.log(`Loading data for ${tenant_id} to the Hubspot account ${account_id}.`);
    ReputationIntegrationConfig.setRefreshToken(account_id, null, tenant_id);
  }

  const rep_client = new ReputationClient(reputationApiKey);
  const hub_client = new HubspotClient(access_token);
  var url = null;
  var locations_count = 0;
  var summaries_count = 0;

  while (true){
    var response = await rep_client.getAllLocations(100, url);

    //logResponse("Response:", response, response.locations);
    var locationIDs = [];
    for (location of response.locations){
      locationIDs.push(location.id);
    }
    // console.log("Getting summaries for the locationsIDs:", locationIDs.join());
    locations_count += locationIDs.length;
    console.log("# of Fetched location ids: ", locations_count);

    var summaries = await rep_client.getSummary(locationIDs.join());
    //console.log("Saving summary to hubspot",   summaries);

    var saved_summaries = await hub_client.saveReputationSummary(summaries, account_id);
    summaries_count += saved_summaries? saved_summaries.length : 0;

    console.log("# of saved repscore:", summaries_count);

    if (response.paging.next){
      console.log("Handling more locations:", response.paging.next);
      url = response.paging.next;
    }
    else {
      // No more
      break;
    }
  }
  // Save to
  console.log("Saved All summary to Hubspot.");
  const result ={
    "sucess": 'true',
    "locations_count": locations_count,
    "repscore_count": summaries_count
  };
  return result;
};

//module.exports = {
//	upload_summary: upload_summary
//};