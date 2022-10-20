var cron = require('node-cron')
const ReputationIntegrationConfig = require('./config');
const services = require('./services');

// Schedule to run at 2:00 everyday
cron.schedule('0 0 2 * * *', () => {
  console.log('Running the cron job: uploading summary...');
  var accounts = ReputationIntegrationConfig.getAccounts();

  for (var account_id in accounts) {
    var account = accounts[account_id];
    try {
      if (account.schedule){
        console.log(`Schedule to run: Account_id: ${account_id}`);
        console.log(`tenant_id: ${account.tenant_id}`);
        var result = services.upload_summary(account_id, account.tenant_id);
        console.log("Cron job on uploading results:", JSON.stringify(result, null, 2));
      }
      else {
        // console.log(`NOT schedule to run: Account_id: ${account_id}`);
      }
    }
    catch (e) {
      console.error("Error caught in the cron job " + account_id, e);
    }
  }
})