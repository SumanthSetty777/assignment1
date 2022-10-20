const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise-native');

const session = require('express-session');
require('dotenv').config({ path: '.env' });

// Turn on cron
require('./cron');

const {HubspotClient, TokenCache} = require('./hub');
const ReputationClient = require('./reputation_api');
const ReputationIntegrationConfig = require('./config');
const services = require('./services');

const PORT = 8080;
const OBJECTS_LIMIT = 30;

const logResponse = (message, data) => {
  console.log(message, JSON.stringify(data, null, 1));
};

const handleError = (e, res) => {
  console.error(e);
  res.render("error", {
    "error" : e.message + "-"+ JSON.stringify(e, null, 2)
  });
};

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Use a session to keep track of client ID
app.use(session({
  secret: Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: true
}));


app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
  })
);

app.use(
  bodyParser.json({
    limit: '50mb',
    extended: true,
  })
);

app.get('/', async (req, res) => {
  res.render('info', {
     "message": "This is the app for Hubspot integration."
  });
});

app.get('/dashboard', async (req, res) => {
  try {
    if (!req.query.force){
        throw new Error(req.url + " restricted.")
    }
    ReputationIntegrationConfig.loadConfig();
    const accounts = ReputationIntegrationConfig.accounts;
    const tenants = ReputationIntegrationConfig.tenants;

    account_array = [];
    for (var key in accounts){
      console.debug("account:", key, accounts);
      account_array.push(accounts[key]);
    }
    tenant_array = [];
    for (var key in tenants){
      console.debug("tenant:", key);
      tenant_array.push(tenants[key]);
    }
    res.render('configs', {
      "accounts": account_array,
      "tenants": tenant_array
    });
  }
  catch (e) {
    handleError(e, res);
  }
});

app.use('/install', async (req, res) => {
  // Use the client to get authorization Url
  const authorizationUrl = HubspotClient.getAuthUrl();
  console.debug('Authorization Url:', authorizationUrl);

  res.redirect(authorizationUrl);
});

app.get('/oauth-callback', async (req, res) => {
  try {
    console.log('===> Step 3: Handling the request sent by the server');

    // Received a user authorization code, so now combine that with the other
    // required values and exchange both for an access token and a refresh token
    if (req.query.code) {
      console.debug('> Received an authorization token');

      const tokens = await HubspotClient.getTokenFromCode(req.query.code);

      if (!tokens || !tokens.access_token || !tokens.refresh_token){
        throw new Error("Unable to get token:", tokens.message);
      }
      const access_token = tokens.access_token;
      const refresh_token = tokens.refresh_token;

      var account = await new HubspotClient(access_token).getAccountInfo();
      if (!account || !account.portalId){
        throw new Error("Unable to get account info.");
      }
      console.debug("account details:", account);
      console.log("accountId:", account.portalId);

      var account_id = account.portalId;

      if (account_id && access_token){
        TokenCache.setAccessToken(account_id, access_token, Math.round(tokens.expires_in * 0.75));
      }
      if (account_id && refresh_token){
        TokenCache.setRefreshToken(account_id, refresh_token);
        // Save refresh token
        console.debug("Setting config: refresh_token", account.portalId, refresh_token);
        ReputationIntegrationConfig.setRefreshToken(account.portalId, refresh_token);
      }

      //console.log("Create HubspotClient with access token:", access_token, refresh_token);
      await new HubspotClient(access_token).createSchema();

      // setup tenant information
      res.render('config_tenant', {
        "account": account_id
      });
    }
    else {
      res.render("error", {
          "error" : "Invalid url. Please check with the app provider."
      });
    }
  } catch (e) {
    handleError(e, res);
  }
});

// Post a form for configuration
app.post('/config', async (req, res) => {
  try {
    var tenant_id = req.body.tenant;
    var api = req.body.api_key;
    var account_id = req.body.account;
    var refresh_token = req.body.refresh_token;
    var tenant_name = req.body.tenant_name;
    var account_name = req.body.account_name;
    var schedule_daily = req.body.schedule;

    console.log("queries:", req.query, req.body, account_id, tenant_id);

    if ((tenant_id && api) || (account_id)){
      if (tenant_id && api) {
        ReputationIntegrationConfig.setApiKey(tenant_id, api, tenant_name);
      }
      if (account_id) {
        ReputationIntegrationConfig.setRefreshToken(account_id, refresh_token, tenant_id, account_name, schedule_daily);
      }
    }
    else {
      throw new Error("tenant/api_key or account/refresh_token need to be provided.");
    }
    res.render('info', {
      "message": 'Successful to configure tenant!'
    });
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/health', async (req, res) => {
  res.send("OK");
});

app.get('/configs', async (req, res) => {
  try {
    if (!req.query.force){
      throw new Error(req.url + " restricted.")
    }
    const data = {
      "account": ReputationIntegrationConfig.getAccounts(),
      "tenant": ReputationIntegrationConfig.getTenants(),
    };
    res.send(JSON.stringify(data, null, 4) );
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/config-tenant', async (req, res) => {
  try {
    res.render('config_tenant');
  } catch (e) {
    handleError(e, res);
  }
});

const saveConfig = async () => {
  ReputationIntegrationConfig.saveConfig();
};

app.get('/batch', async (req, res) => {
  try {
    var account_id = req.query.account;
    var tenant_id = req.query.tenant;

    if (!account_id || !tenant_id){
      throw new Error("Please provide hubspot account and tenant id to proceed.");
    }
    const result = await services.upload_summary(account_id, tenant_id);

    res.render('info', {
      "message" : JSON.stringify(result, null, 2)
    });
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/error', (req, res) => {
  res.render('error', { error: req.query.msg });
});

const server = app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
