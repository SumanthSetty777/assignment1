var fs = require('fs');
const request = require('request-promise-native');
const path = require('path');
const hubspot = require('@hubspot/api-client');
const NodeCache = require('node-cache');

const PORT = 8080;
const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

const SCOPES = process.env.HUBSPOT_SCOPES;
const REDIRECT_URI = process.env.HUBSPOT_CALLBACK || `http://localhost:${PORT}/oauth-callback`;



const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
};

const toCustomHubspotSummary = (summaryResponse) => {
  summaries = []
  var fromDate = summaryResponse.dateRange.from;
  fromDate = fromDate.split('T')[0];
  for (location of summaryResponse.summary.locations) {
    hubSpotSummary = {}
    hubSpotSummary['report_date'] =  fromDate
    hubSpotSummary['location_id'] = location.id;
    hubSpotSummary['score'] = location.score;
    hubSpotSummary['location'] = location.name;
    hubSpotSummary['review_count']=location.count||0;
    hubSpotSummary['rating']=location.rating||0;
    hubSpotSummary['response_count']=location.responseCount||0;
    hubSpotSummary['positive_sentiment']= location.sentimentCount? location.sentimentCount.positive||0 : 0;
    hubSpotSummary['neutral_sentiment']=location.sentimentCount? location.sentimentCount.neutral || 0 : 0;
    hubSpotSummary['negative_sentiment']=location.sentimentCount? location.sentimentCount.negative || 0 : 0;

    if (location.scoreSignals){
      hubSpotSummary['star_average']=location.scoreSignals.starAverage;
      hubSpotSummary['review_volume']=location.scoreSignals.reviewVolume;
      hubSpotSummary['review_recency']=location.scoreSignals.reviewRecency;
      hubSpotSummary['review_length']=location.scoreSignals.reviewLength;
      hubSpotSummary['review_spread']=location.scoreSignals.reviewSpread;
      hubSpotSummary['review_response']=location.scoreSignals.reviewResponse;
      hubSpotSummary['search_impression']=location.scoreSignals.searchImpression;
      hubSpotSummary['listing_accuracy']=location.scoreSignals.listingAccuracy;
      hubSpotSummary['social_engagement']=location.scoreSignals.socialEngagement;
    }
    summaries.push(hubSpotSummary);
  }
  return summaries;
}

class HubspotClient {
  constructor(access_token) {
    this.access_token = access_token;
    this.file_name = path.resolve(__dirname, './schemas/summary-schema.json');
    //console.log("File name:", this.file_name);
    this.summary_schemas = JSON.parse(fs.readFileSync(this.file_name, 'utf8'));

    this.hubspotClient = new hubspot.Client();
    // console.log("Create hubspot client with access token", access_token);
    this.hubspotClient.setAccessToken(access_token);
  }

   static getAuthUrl(){
    return new hubspot.Client().oauth.getAuthorizationUrl(
        CLIENT_ID,
        REDIRECT_URI,
        SCOPES
    );
  }

  async createSchema(){
    const uri = 'https://api.hubapi.com/crm/v3/schemas';
    try {
      console.log("Schema:", this.summary_schemas);
  //    const apiResponse = await this.hubspotClient.crm.schemas.coreApi.create(this.summary_schemas);
  //    console.log(JSON.stringify(apiResponse.body, null, 2));
  //
      const headers = {
        Authorization: `Bearer ${this.access_token}`,
        'Content-Type': 'application/json'
      };
      var options = {
        method: 'POST',
        uri: uri,
        headers: headers,
        body: this.summary_schemas,
        json: true // Automatically stringifies the body to JSON
      };
      const responseBody = await request(options);
      //console.log("createSchema Response:", responseBody);
    } catch (e) {
      //e.message === 'HTTP request failed'
      console.error("Failed to create schema:", e.message);
      console.debug(JSON.stringify(e.response.body, null, 2));
    }
  }

  async getAccountInfo(){
    const uri = 'https://api.hubapi.com/account-info/v3/details';
    try {
      const headers = {
        Authorization: `Bearer ${this.access_token}`,
        'Content-Type': 'application/json'
      };
      var options = {
        method: 'GET',
        uri: uri,
        headers: headers
      };
      const apiResponse = await request(options);
      console.log("uri:", uri)
      console.log("Response:", apiResponse);
      return JSON.parse(apiResponse);;

    } catch (e) {
      console.error("Failed to get account info:", e.message);
      console.debug(JSON.stringify(e.response.body, null, 2));
      return e.response.body;
    }
  }

  async getReputationSummary(maxRows=10, account_id){
    try {
      const objectType = `p${account_id}_reputation_summary`;
      const limit = maxRows;
      const after = undefined;
      const properties = [
        "location_id", "location", "report_date", "score", "positive_sentiment", "negative_sentiment", "review_count",
        "social_engagement","search_impression","star_average", "rating", "response_count","report_date"
      ];
      const propertiesWithHistory = undefined;
      const associations = undefined;
      const archived = false;
      //
      const apiResponse = await this.hubspotClient.crm.objects.basicApi.getPage(objectType,limit, after, properties, propertiesWithHistory, associations, archived);
  //    uri = `https://api.hubapi.com/crm/v3/objects/${objectType}?limit=${limit}&properties=location_id,location,report_date,score`
  //    const headers = {
  //      Authorization: `Bearer ${access_token}`,
  //      'Content-Type': 'application/json'
  //    };
  //    var options = {
  //      method: 'GET',
  //      uri: uri,
  //      headers: headers
  //    };
  //    apiResponse = await request(options);
  //    console.log("uri:", uri)
      //console.log("Response-:", apiResponse, JSON.stringify(apiResponse.results, null, 2));
      return apiResponse.results;

    } catch (e) {
      console.error("Failed to push reputation scores:", e.message);
      console.debug(JSON.stringify(e.response, null, 2));
    }
  }

  async saveReputationSummary(summaryResponse, account_id){
    var summaries = toCustomHubspotSummary(summaryResponse)
    const objectType = `p${account_id}_reputation_summary`;

    for (var properties of summaries){
        //console.debug('Write custom object:BEFORE', properties);
        const SimplePublicObjectInput = { properties };
        // p22563867_location_summary p22563867_reputation_summary p22563867_subsidiary_summary
        const apiResponse = await this.hubspotClient.crm.objects.basicApi.create(objectType, SimplePublicObjectInput);
        //console.debug('Response from API', apiResponse.body);
    }
    return summaries;
  }

  static async getTokenFromCode(code){
    const authCodeProof = {
      grant_type: GRANT_TYPES.AUTHORIZATION_CODE,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code
    };
    return await HubspotClient.exchangeForTokens(authCodeProof);
  }

  static async exchangeForTokens(exchangeProof) {
    try {
      const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
        form: exchangeProof
      });
      // Usually, this token data should be persisted in a database and associated with
      // a user identity.
      const tokens = JSON.parse(responseBody);

//      TokenCache.setRefreshToken(accountId, tokens.refresh_token)
//      TokenCache.setAccessToken(accountId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

//      hubspotClient.setAccessToken(tokens.access_token);

      console.debug('> Received an access token and refresh token');
      console.debug('  > tokens:', tokens);
      console.debug('  > access_token:', tokens.access_token);
      console.debug('  > refresh token:', tokens.refresh_token);
      return tokens;
    } catch (e) {
      console.error(` > Error exchanging ${exchangeProof.grant_type} for access token`);
      //return JSON.parse(e.response.body);
      throw new Error("Failed to exchange Tokens:" + e.response.body);
    }
  }

  static async refreshAccessToken(account_id, refresh_token=null) {
    if (!refresh_token){
      refresh_token = TokenCache.getRefreshToken(account_id);
    }
    if (!refresh_token){
      throw new Error("Can't refresh access token because no refresh_token provided.");
    }

    const refreshTokenProof = {
      grant_type: GRANT_TYPES.REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      refresh_token: refresh_token
    };
    const tokens = await HubspotClient.exchangeForTokens(refreshTokenProof);
    return tokens.access_token;
  };

  async getAccessToken(accountId) {
    // If the access token has expired, retrieve
    // a new one using the refresh token
    if (!TokenCache.getAccessToken(accountId)) {
      console.log('Refreshing expired access token');
      return await HubspotClient.refreshAccessToken(accountId);
    }
    return TokenCache.getAccessToken(accountId);
  }
};

class TokenCache {
  // Account map
  // key account_id as the key,
  // value includes: refresh_token, access_token and REPUTATION_API
  //
  //static accountMap = {};
  static refreshTokenStore = {};
  static accessTokenCache = new NodeCache({ deleteOnExpire: true });

  static getAccessToken(account_id){
    return TokenCache.accessTokenCache.get(account_id);
  }

  static setAccessToken(account_id, token, expired_time){
    TokenCache.accessTokenCache.set(account_id, token, expired_time);
  }

  static getRefreshToken(account_id){
    return TokenCache.refreshTokenStore[account_id];
  }

  static setRefreshToken(account_id, refresh_token){
     TokenCache.refreshTokenStore[account_id] = refresh_token;
  }
};

module.exports = { HubspotClient, TokenCache };