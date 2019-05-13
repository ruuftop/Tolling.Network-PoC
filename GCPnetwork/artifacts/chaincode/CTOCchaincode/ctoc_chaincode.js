/*

*/

const shim = require('fabric-shim');
const util = require('util');
const fs = require('fs');

var Chaincode = class {

  // Initialize the CTOC chaincode
  async Init (stub){
    console.info('=========== Initialize CTOC chaincode ===========');
    let allIndexes = {};
    allIndexes.toll_Charges_File_Index = 0;
    await stub.putState("ALLINDEXES", Buffer.from(JSON.stringify(ALLINDEXES)));
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


  async addTollCharges(stub, args){
    console.info('============= END : adding toll charges record ===========');

    let toll_charges = {};

   // Detailed record from file
    let toll_charges.tag_ID = args[0];
    let toll_charges.tran_number = Number(args[1]);
    let toll_charges.tran_amount = Number(args[2]);
    let toll_charges.entry_tran_date = args[3];
    let toll_charges.entry_tran_time = args[4];
    let toll_charges.entry_plaza = Number(args[5]);
    let toll_charges.entry_lane = Number(args[6]);
    let toll_charges.exit_tran_date = args[7];
    let toll_charges.exit_tran_time = args[8];
    let toll_charges.exit_plaza = Number(args[9]);
    let toll_charges.exit_lane = Number(args[10]);
    let toll_charges.axle_count = Number(args[11]);
    let toll_charges.occupancy = Number(args[12]);
    let toll_charges.protocol_type = Number(args[13]);
    let toll_charges.vehicle_type = Number(args[14]);

   // Header record from file. In the future, check if some of these can be omitted
    let toll_charges.fileType = "TOLL";
    let toll_charges.sequence_number = Number(args[15]);
    let toll_charges.business_date = args[16];
    let toll_charges.source = args[17];
    let toll_charges.destination = args[18];
    let toll_charges.create_date = args[19];
    let toll_charges.create_time = args[20];
    let toll_charges.version = args[21];


    await stub.putState(toll_charges.tran_number.toString(), Buffer.from(JSON.stringify(toll_charges)));

    console.info('============= END : successfully added toll charges record ===========');
  }

  async addReconTollCharges(stub,args){
    console.info('============= END : adding Reconciled Toll charges record ===========');

    let recon_toll_charges = {};

    //Detailed record from file
    let recon_toll_charges.tag_ID = args[0];
    let recon_toll_charges.tran_number = Number(args[1]);
    let recon_toll_charges.tran_amount = Number(args[2]);
    let recon_toll_charges.entry_tran_date = args[3];
    let recon_toll_charges.entry_tran_time = args[4];
    let recon_toll_charges.entry_plaza = Number(args[5]);
    let recon_toll_charges.entry_lane = Number(args[6]);
    let recon_toll_charges.exit_tran_date = args[7];
    let recon_toll_charges.exit_tran_time = args[8];
    let recon_toll_charges.exit_plaza = Number(args[9]);
    let recon_toll_charges.exit_lane = Number(args[10]);
    let recon_toll_charges.axle_count = Number(args[11]);
    let recon_toll_charges.occupancy = Number(args[12]);
    let recon_toll_charges.protocol_type = Number(args[13]);
    let recon_toll_charges.post_amt = Number(args[14]);
    let recon_toll_charges.response_code = Number(args[15]);

     // Header record from file. In the future, check if some of these can be omitted
    let recon_toll_charges.fileType = "RECONCILE";
    let recon_toll_charges.sequence_number = Number(args[16]);
    let recon_toll_charges.business_date = args[17];
    let recon_toll_charges.source = args[18];
    let recon_toll_charges.destination = args[19];
    let recon_toll_charges.create_date = args[20];
    let recon_toll_charges.create_time = args[21];
    let recon_toll_charges.version = args[22];

    let key = 'R' + recon_toll_charges.tran_number.toString()

    await stub.putState(key, Buffer.from(JSON.stringify(recon_toll_charges)));

    console.info('============= END : successfully added Recon toll charges record ===========');


  }

  async addTagStatus(stub,args) {
   console.info('============= END : adding Tag status record ===========');

  let tag = {};
   //Detailed record from file
  let tag.tag_ID = args[0];
  let tag.account_id = Number(args[1]);
  let tag.action_code = args[2];
  let tag.tag_type = args[3];
  let tag.subtype-a = args[4];
  let tag.subtype-b = args[5];
  let tag.subtype-c = args[6];
  let tag.protocol_type = args[7];

  // Header record from file. In the future, check if some of these can be omitted
  let tag.fileType = "TAGS"
  let tag.action_code_header = args[8];
  let tag.sequence_number = Number(args[9]);
  let tag.business_date = args[10];
  let tag.source = args[11];
  let tag.destination = args[12];
  let tag.create_date = args[13];
  let tag.create_time = args[14];
  let tag.version = args[15];

  await stub.putState(tag.account_id.toString(), Buffer.from(JSON.stringify(tag)));
  console.info('============= END : successfully added  tag status record ===========');


  }

  async addPaybyPlate(stub,args) {
    console.info('============= END : adding  pay by plate record ===========');

    let pay_by_plate = {};

    //Detail record
    let pay_by_plate.license_plate = args[0];
    let pay_by_plate.tran_number = Number(args[1]);
    let pay_by_plate.state = args[2];
    let pay_by_plate.tran_amt = Number(args[3]);
    let pay_by_plate.entry_tran_date = args[4];
    let pay_by_plate.entry_tran_time = args[5];
    let pay_by_plate.entry_plaza = args[6];
    let pay_by_plate.entry_lane = args[7];
    let pay_by_plate.exit_tran_date = args[8];
    let pay_by_plate.exit_tran_time = args[9];
    let pay_by_plate.exit_plaza = args[10];
    let pay_by_plate.exit_lane = args[11];
    let pay_by_plate.axle_count = Number(args[12]);
    let pay_by_plate.vehicle_type = Number(args[13]);

    // Header record from file. In the future, check if some of these can be omitted
    let pay_by_plate.fileType = "PAYBYPLATE";
    let pay_by_plate.sequence_number = Number(args[14]);
    let pay_by_plate.business_date = args[15];
    let pay_by_plate.source = args[16];
    let pay_by_plate.destination = args[16];
    let pay_by_plate.create_date = args[17];
    let pay_by_plate.create_time = args[18];
    let pay_by_plate.version = args[19];

    await stub.putState(pay_by_plate.tran_number.toString(), Buffer.from(JSON.stringify(pay_by_plate)));
    console.info('============= END : successfully added  pay by plate record ===========');


  }

  async addReconPaybyPlate(stub,args) {
   console.info('============= END : adding  recon pay by plate recon record ===========');

   let recon_pay_by_plate = {};

   //Detail record
   let recon_pay_by_plate.license_plate = args[0];
   let recon_pay_by_plate.tran_number = Number(args[1]);
   let recon_pay_by_plate.state = args[2];
   let recon_pay_by_plate.tran_amt = Number(args[3]);
   let recon_pay_by_plate.entry_tran_date = args[4];
   let recon_pay_by_plate.entry_tran_time = args[5];
   let recon_pay_by_plate.entry_plaza = args[6];
   let recon_pay_by_plate.entry_lane = args[7];
   let recon_pay_by_plate.exit_tran_date = args[8];
   let recon_pay_by_plate.exit_tran_time = args[9];
   let recon_pay_by_plate.exit_plaza = args[10];
   let recon_pay_by_plate.exit_lane = args[11];
   let recon_pay_by_plate.axle_count = Number(args[12]);
   let recon_pay_by_plate.post_amt = Number(args[13]);
   let recon_pay_by_plate.recon_code = args[14];

   // Header record from file. In the future, check if some of these can be omitted
   let recon_pay_by_plate.fileType = "PLATERECON";
   let recon_pay_by_plate.sequence_number = Number(args[15]);
   let recon_pay_by_plate.business_date = args[16];
   let recon_pay_by_plate.source = args[17];
   let recon_pay_by_plate.destination = args[18];
   let recon_pay_by_plate.create_date = args[19];
   let recon_pay_by_plate.create_time = args[20];
   let recon_pay_by_plate.version = args[21];

   let key = 'R' + recon_pay_by_plate.tran_number.toString()

   await stub.putState(key, Buffer.from(JSON.stringify(recon_pay_by_plate)));
   console.info('============= END : successfully added  pay by plate recon record ===========');

  }

  async addLicensePlateStatus(stub,args) {
    console.info('============= END : adding license plate status record ===========');

    let license_plate_status = {};

    //Detail Record
    let license_plate_status.account_id = Number(args[0]);
    let license_plate_status.license_plate = args[1];
    let license_plate_status.state = args[2];
    let license_plate_status.action_code = args[3];
    let license_plate_status.effective_start_date = args[4];
    let license_plate_status.effective_end_date = args[5];
    let license_plate_status.plate_type = args[6];
    let license_plate_status.sub_type = args[7];

    // Header record from file. In the future, check if some of these can be omitted
    let license_plate_status.fileType = "PLATES";
    let license_plate_status.update_code = args[8];
    let license_plate_status.sequence_number = Number(args[9]);
    let license_plate_status.source = args[10];
    let license_plate_status.destination = args[11];
    let license_plate_status.create_date = args[12];
    let license_plate_status.create_time = args[13];
    let license_plate_status.version = args[14];

    let key = license_plate_status.account_id.toString() + license_plate_status.license_plate;

    await stub.putState(key, Buffer.from(JSON.stringify(license_plate_status)));
    console.info('============= END : successfully added license plate status record ===========');

  }


};

shim.start(new Chaincode());
