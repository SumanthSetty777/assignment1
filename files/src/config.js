var config = require('config');
process.env.ALLOW_CONFIG_MUTATIONS = "true";
const fs = require('fs');
const path = require('path');
const importFresh = require('import-fresh');

class ReputationIntegrationConfig {
  static accounts = config.get('account');
  static tenants = config.get('tenant');

  static loadConfig(){
    ReputationIntegrationConfig.accounts = config.get('account');
    ReputationIntegrationConfig.tenants = config.get('tenant');
  }

  static getAccounts(){
    return config.get('account');
  }

  static getTenants(){
    return config.get('tenant');
  }

  static getApiKey(tenant_id){
    const key = `tenant.${tenant_id}.API_KEY`;
    //console.log("Key", key);
    return config.get(key);
  }

  static getAccessToken(account_id){
    try {
      return config.get(`account.${account_id}.access_token`);
    }
    catch (e){
      console.error(e);
    }
    return null;
  }

  static getRefreshToken(account_id){
    try {
      return config.get(`account.${account_id}.refresh_token`);
    }
    catch (e){
      console.error(e);
    }
    return null;
  }

  static setApiKey(tenant_id, api_key=null, tenant_name = null){
    //console.log("tenants: ",ReputationIntegrationConfig.tenants);
    if (!ReputationIntegrationConfig.tenants){
      ReputationIntegrationConfig.loadConfig();
    }

    if (!tenant_id && !api_key && !tenant_name){
      // nothing to set
      console.log("Nothing to set");
      return;
    }

    if (!ReputationIntegrationConfig.tenants[tenant_id]){
      ReputationIntegrationConfig.tenants[tenant_id] = {
        "tenant_id": tenant_id
      };
    }

    if (api_key){
      ReputationIntegrationConfig.tenants[tenant_id].API_KEY = api_key;
    }

    if (tenant_name){
      ReputationIntegrationConfig.tenants[tenant_id].name = tenant_name;
    }
    // saveConfig
    //console.log("updated tenant: ", ReputationIntegrationConfig.tenants);
    importFresh('config');
    ReputationIntegrationConfig.saveConfig();
  }

  static setRefreshToken(account_id, refresh_token=null, tenant_id = null, account_name=null, schedule_daily=null){
    //console.log("account: ",ReputationIntegrationConfig.accounts);

    if (!ReputationIntegrationConfig.accounts){
      ReputationIntegrationConfig.loadConfig();
    }
    if (!account_id && !refresh_token && !tenant_id && !account_name){
      // nothing to set
      console.log("Nothing to set");
      return;
    }

    if (!ReputationIntegrationConfig.accounts[account_id]){
      ReputationIntegrationConfig.accounts[account_id] = {
        "account_id" : account_id
      };
    }
    if (refresh_token){
      ReputationIntegrationConfig.accounts[account_id].refresh_token = refresh_token;
    }
    if (tenant_id){
      ReputationIntegrationConfig.accounts[account_id].tenant_id = tenant_id;
    }
    if (account_name){
      ReputationIntegrationConfig.accounts[account_id].name = account_name;
    }
//    if (schedule_daily){
//      ReputationIntegrationConfig.accounts[account_id].schedule = schedule_daily;
//    }
    // Allow to override
    ReputationIntegrationConfig.accounts[account_id].schedule = schedule_daily;
    // saveConfig
    //console.log("updated account: ", ReputationIntegrationConfig.accounts);
    ReputationIntegrationConfig.saveConfig();
    importFresh('config');
  }

  static saveConfig(){
    // Save configuration
    if (!ReputationIntegrationConfig.tenants && !ReputationIntegrationConfig.accounts){
      // No need to save if both are empty
      return;
    }

    const configToBe = {
      "tenant": ReputationIntegrationConfig.tenants,
      "account": ReputationIntegrationConfig.accounts
    }
    //console.log("Saving config", configToBe);

    let data = JSON.stringify(configToBe, null, 2);
    const file_name = path.resolve(__dirname, '../config/default.json');
    fs.writeFileSync(file_name, data, (err) => {
      if (err) throw err;
      //console.log('Data written to file');
    });
  }
};

module.exports = ReputationIntegrationConfig;