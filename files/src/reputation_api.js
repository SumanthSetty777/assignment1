const request = require('request-promise-native');

class ReputationClient {
  constructor(api_key) {
    this.api_key = api_key;
  }

  async getSummary(locationIDs, range="Yesterday",groupBy='Location'){
    console.log('Get summary from reputation:', locationIDs);
    try {
        const headers = {
          'X-API-KEY': `${this.api_key}`,
          'Content-Type': 'application/json'
        };
        const url = `https://api.reputation.com/v3/summary?range=${range}&locationIDs=${locationIDs}&groupBy=${groupBy}`
        console.log('url:' + url);
        const result = await request.get(url, {
          headers: headers
        });
        //console.log('Response from Reputation API', result);
        return JSON.parse(result);
    } catch (e) {
        console.error('  > Unable to retrieve summary', e);
        return JSON.parse(e.response);
    }
  }

  async getAllLocations(maxRows=20, url=null) {
    console.log('Get all locations from reputation:');
    try {
      const headers = {
        'X-API-KEY': `${this.api_key}`,
        'Content-Type': 'application/json'
      };
      if (url == null){
        url = `https://api.reputation.com/v3/locations?limit=${maxRows}`
      }

      console.log('url:' + url);
      const result = await request.get(url, {
        headers: headers
      });
      //console.log('Response from Reputation API', result);
      return JSON.parse(result);
    } catch (e) {
      console.error('  > Unable to retrieve summary', e);
      return JSON.parse(e.response.body);
    }
  }
}

module.exports = ReputationClient;