/*
Add data to the State

===================== Add new Accounts ==============================
peer chaincode invoke -n cc -C channel1 -c '{"Args":["addAccount","C032699024","TX","3PCH418","A8-5F-E6-05-C3-4D","SCHJ.575596372","1"]}'
peer chaincode invoke -n cc -C channel1 -c '{"Args":["addAccount","A358036353","CA","1OXF345","F0-FD-A4-80-C3-43","BOMC.521511316","1"]}'
peer chaincode invoke -n cc -C channel1 -c '{"Args":["addAccount","B541007088","MI","7DWL777","B7-4A-52-7C-8F-42","OLYT.406781605","1"]}'
peer chaincode invoke -n cc -C channel1 -c '{"Args":["addAccount","D351370886","NY","7FAY856","E1-0F-98-FF-04-5F","AZBM.469240152","1"]}'


==================== Query Account data =================
peer chaincode query -C channel1 -n cc -c '{"Args":["queryAccount", "B541007088"]}'

=================== Change Account Status ===================
peer chaincode invoke -C channel1 -n cc -c '{"Args":["changeAccountStatus", "C032699024", "0"]}'

=================== Add new transactions ===================
peer chaincode invoke -C channel1 -n cc -c '{"Args":["addTransaction", "C032699024", "A", "2" , "10/16/2018", "2", "locA1", "unpaid"]}'
peer chaincode invoke -C channel1 -n cc -c '{"Args":["addTransaction", "A358036353", "B", "2" , "10/18/2018", "3", "locB1", "unpaid"]}'
peer chaincode invoke -C channel1 -n cc -c '{"Args":["addTransaction", "B541007088", "D", "3" , "10/21/2018", "4", "locD1", "unpaid"]}'
peer chaincode invoke -C channel1 -n cc -c '{"Args":["addTransaction", "D351370886", "C", "3" , "10/15/2018", "5", "locC1", "paid"]}'

==================== Query transaction data based on transaction id =================
peer chaincode query -C channel1 -n cc -c '{"Args":["queryTransaction", "1"]}'

==================== Query transaction data based on Host =================
peer chaincode query -C channel1 -n cc -c '{"Args":["queryTransactionsByHost", "D"]}'

*/

const shim = require('fabric-shim');
const util = require('util');
const fs = require('fs');

var Chaincode = class {

  // Initialize the chaincode
  async Init (stub){
    console.info('=========== Instantiated fabcar chaincode ===========');
    let allTransactions = {};
    allTransactions.totalTransactions = 0;
    await stub.putState("TRANSACTIONS", Buffer.from(JSON.stringify(allTransactions)));
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async addAccount (stub,args) {
    console.log('========Ledger Initialization========');

    // initialise only if 6 parameters passed.
    if (args.length != 6) {
      return shim.error('Incorrect number of arguments. Expecting 6');
    }
    let accountID = args[0];
    let lpJurisdiction = args[1];
    let lpNumber = args[2];
    let macAddress = args[3];
    let tagID = args[4];
    let accountStatus = args[5];


    let account = {};
    account.docType = 'account';
    account.accountID = accountID;
    account.lpJurisdiction = lpJurisdiction;
    account.lpNumber = lpNumber;
    account.macAddress = macAddress;
    account.tagID = tagID;
    account.accountStatus = accountStatus;

    await stub.putState(accountID, Buffer.from(JSON.stringify(account)));

    console.info('============= END : Added account ===========');

   }

  async changeAccountStatus(stub, args) {
    console.info('============= START : changeAccountStatus ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let accountAsBytes = await stub.getState(args[0]);
    let account = JSON.parse(accountAsBytes);
    account.accountStatus = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(account)));
    console.info('============= END : changeAccountStatus ===========');
  }

  async queryAccount(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting Account Id ex: C032699024');
    }
    let accountID = args[0];

    let accountAsBytes = await stub.getState(accountID); //get the account from chaincode state
    if (!accountAsBytes || accountAsBytes.toString().length <= 0) {
      throw new Error(accountID + ' does not exist: ');
    }
    console.log(accountAsBytes.toString());
    return accountAsBytes;
  }

  async addTransaction(stub,args){
    //expecting accountID, hostAgency, amount, dateTime, vehicleClass, location, transactionStatus
    if (args.length != 7) {
        return shim.error('Incorrect number of arguments. Expecting 7');
    }

    // account should exist in the Blockchain
    let accountAsBytes = await stub.getState(args[0]);
    if (!accountAsBytes || accountAsBytes.toString().length <= 0) {
      throw new Error(accountID + ' does not exist: ');
    }

    //Transaction sould not be older than 30 days
    var transaction_date = new Date(args[3]);
      var today = new Date();
      var timeDiff = Math.abs(today.getTime() - transaction_date.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if(diffDays > 30){
        throw new Error('Cannot add transactions older than 30 days');
      }

    let staticTransactionAsBytes = await stub.getState("TRANSACTIONS");
    let staticTransactionAsJSON = JSON.parse(staticTransactionAsBytes.toString());
    console.info('============= total transactions so far ===========');
    console.log(staticTransactionAsJSON.totalTransactions);


    let transaction = {}
    transaction.docType = "Transaction";
    transaction.transactionID = staticTransactionAsJSON.totalTransactions + 1;
    transaction.accountID = args[0];
    transaction.hostAgency = args[1];
    transaction.amount = args[2];
    transaction.dateTime = args[3];
    transaction.vehicleClass = args[4]; // possible values: 2,3,4,5,6
    transaction.location = args[5];
    transaction.transactionStatus = args[6]; // possible values: unpaid, paid and dispute

    await stub.putState(transaction.transactionID.toString(), Buffer.from(JSON.stringify(transaction)));
    staticTransactionAsJSON.totalTransactions = transaction.transactionID;
    await stub.putState("TRANSACTIONS", Buffer.from(JSON.stringify(staticTransactionAsJSON)) );

    console.info('=============Transactions successfully added ===========');


  }

  async queryTransaction(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting transaction Id ex: 5');
    }
    let transactionID = args[0];

    let transactionAsBytes = await stub.getState(transactionID); //get the account from chaincode state
    if (!transactionAsBytes || transactionAsBytes.toString().length <= 0) {
      throw new Error(transactionID + ' does not exist: ');
    }
    console.log(transactionAsBytes.toString());
    return transactionAsBytes;
  }

  // In progress
  async getamountOwed(stub, args, thisClass) {
    if (args.length != 1) {
      // args[0] = host agency.
      throw new Error('Incorrect number of arguments. Expecting parent and host agency');
    }

    let max_transactions = await stub.getState("TRANSACTIONS");
    max_transactions = Number(max_transactions);
    let moneyOwed = [];
    let method = thisClass["queryTransaction"];
    let queryResults ;
    // money owed is a 2 * 2 Array. For example the contents would be. Can also be used like a hashmap
    // B 3
    // C 5
    // D 6
    for(var i=0; i<= max_transactions; i++){
        queryResults = await method(stub, i); // We get the result in bytes. Need to convert it to JSON.
        let queryResultsAsJSON = JSON.parse(queryResults.toString());
        if(queryResultsAsJSON.hostAgency == args[0] && queryResultsAsJSON.transactionStatus.toLowerCase() == "unpaid"){
            var accountID = queryResultsAsJSON.accountID
            if(moneyOwed[accountID.charAt(0)]){
              moneyOwed[accountID.charAt(0)] = moneyOwed[accountID.charAt(0)] + (0.08 * Number(queryResultsAsJSON.amount));
            }
            else{
              moneyOwed[accountID.charAt(0)] = 0.08 * Number(queryResultsAsJSON.amount);
            }
        }
    }

    console.log(moneyOwed.toString());

    return moneyOwed;
  }

  // ===== Example: Parameterized rich query =================================================
  // queryTransactionsByHost queries for transactions based on a passed in host agency.
  // This is an example of a parameterized query where the query logic is baked into the chaincode,
  // and accepting a single query parameter (host agency).
  // Only available on state databases that support rich query (e.g. CouchDB)
  // =========================================================================================
  async queryTransactionsByHost(stub, args, thisClass) {
    //   0
    // 'bob'
    if (args.length < 1) {
      throw new Error('Incorrect number of arguments. Expecting host name.')
    }

    let hostAgency = args[0];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'Transaction';
    queryString.selector.hostAgency = hostAgency;
    let method = thisClass['getQueryResultForQueryString'];
    let queryResults = await method(stub, JSON.stringify(queryString), thisClass);
    return queryResults; //shim.success(queryResults);
  }

  // =========================================================================================
  // getQueryResultForQueryString executes the passed in query string.
  // Result set is built and returned as a byte array containing the JSON results.
  // =========================================================================================
  async getQueryResultForQueryString(stub, queryString, thisClass) {

    console.info('- getQueryResultForQueryString queryString:\n' + queryString)
    let resultsIterator = await stub.getQueryResult(queryString);
    let method = thisClass['getAllResults'];

    let results = await method(resultsIterator, false);

    return Buffer.from(JSON.stringify(results));
  }

  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }




};

shim.start(new Chaincode());
