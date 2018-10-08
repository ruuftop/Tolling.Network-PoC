/*
Add data to the State
peer chaincode invoke -n cc -C channel1 -c '{"Args":["InitLedger","account.json"]}'
peer chaincode query -C channel1 -n cc -c '{"Args":["queryAccount", "B608843779"]}'
peer chaincode invoke -C channel1 -n cc -c '{"Args":["changeAccountStatus", "B608843779", "1"]}'
*/

const shim = require('fabric-shim');
const util = require('util');
const fs = require('fs');

var Chaincode = class {

  // Initialize the chaincode
  async Init (stub){
    console.info('=========== Instantiated fabcar chaincode ===========');
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
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async InitLedger (stub,args) {
    console.log('========Ledger Initialization========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);


    let rawdata = fs.readFileSync(args[0]); //argument contains the file name to copy the data from.
    let account = JSON.parse(rawdata);
    let i;
    for(i=0;i<account.length;i++){
        await stub.putState(account[i].Account_id, Buffer.from(JSON.stringify(account[i])));
    }
    console.info('============= END : Added account ===========');

  }

  async changeAccountStatus(stub, args) {
    console.info('============= START : changeAccountStatus ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let accountAsBytes = await stub.getState(args[0]);
    let account = JSON.parse(accountAsBytes);
    account.Account_status = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(account)));
    console.info('============= END : changeAccountStatus ===========');
  }

  async queryAccount(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting Account Id ex: C032699024');
    }
    let Account_id = args[0];

    let accountAsBytes = await stub.getState(Account_id); //get the account from chaincode state
    if (!accountAsBytes || accountAsBytes.toString().length <= 0) {
      throw new Error(Account_id + ' does not exist: ');
    }
    console.log(accountAsBytes.toString());
    return accountAsBytes;
  }


};

shim.start(new Chaincode());
