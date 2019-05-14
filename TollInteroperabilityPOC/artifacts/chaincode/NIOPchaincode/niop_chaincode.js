/*

*/

const shim = require('fabric-shim');
const util = require('util');
const fs = require('fs');

var Chaincode = class {

  // Initialize the chaincode
  async Init (stub){
    console.info('=========== Instantiated fabcar chaincode ===========');
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

  async addTransaction(stub,args){
    console.log('=====started adding transaction=======');
    /*
     First argument should contains the header data and second argument should contain the message data.
    */
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2 arguments header and message');
    }

    let transaction = {};
    let transaction.docType = args[0].substr(0,4); //STRAN is expected
    let TxnDataSeqNum = args[0].substr(37,49); //transaction Data sequence number is a 12 digit number
    let transaction.headerData = args[0];
    let transaction.messageData = args[1];


    await stub.putState(TxnDataSeqNum, Buffer.from(JSON.stringify(transaction)));

    console.info('============= END : Added transaction ===========');
  }

  async addTransactionAdjustment(stub,args){
    console.log('=====started adding Adjustment=======');
    /*
     First argument should contains the header data and second argument should contain the message data.
    */
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2 arguments header and message');
    }

    let Adjustment = {};
    let Adjustment.docType = args[0].substr(0,4); //SCORR is expected
    let CorrDataSeqNum = args[0].substr(37,49); //Correction Data sequence number is a 12 digit number
    let Adjustment.headerData = args[0];
    let Adjustment.messageData = args[1];


    await stub.putState(CorrDataSeqNum, Buffer.from(JSON.stringify(Adjustment)));

    console.info('============= END : Added Adjustment ===========');
  }

  async addTransactionReconciliation(stub,args){
    console.log('=====started adding Reconciliation=======');
    /*
     First argument should contains the header data and second argument should contain the message data.
    */
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2 arguments header and message');
    }

    let Reconciliation = {};
    let Reconciliation.docType = args[0].substr(0,4); //SRECON is expected
    let ReconDataSeqNum = args[0].substr(37,49); //Reconciliation Data sequence number is a 12 digit number
    let Reconciliation.header_data = args[0];
    let Reconciliation.messageData = args[1];


    await stub.putState(ReconDataSeqNum, Buffer.from(JSON.stringify(Reconciliation)));

    console.info('============= END : Added Reconciliation ===========');
  }

  async addTVL(stub,args){
    console.log('=====started adding Tag Validation data=======');
    /*
     First argument should contains the header data and second argument should contain the message data.
    */
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2 arguments header and message');
    }

    let tvl = {};
    let tvl.docType = args[0].substr(0,4); //STVL is expected
    let accountNum = args[1].substr(166,216); // account number from TVL
    let tvl.header_data = args[0];
    let tvl.messageData = args[1];

    await stub.putState(accountNum, Buffer.from(JSON.stringify(tvl)));

    console.info('============= END : Added Tag validation list ===========');
  }







};

shim.start(new Chaincode());
