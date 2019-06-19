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
    toll_charges.tag_ID = args[0];
    toll_charges.tran_number = Number(args[1]);
    toll_charges.tran_amount = Number(args[2]);
    toll_charges.entry_tran_date = args[3];
    toll_charges.entry_tran_time = args[4];
    toll_charges.entry_plaza = Number(args[5]);
    toll_charges.entry_lane = Number(args[6]);
    toll_charges.exit_tran_date = args[7];
    toll_charges.exit_tran_time = args[8];
    toll_charges.exit_plaza = Number(args[9]);
    toll_charges.exit_lane = Number(args[10]);
    toll_charges.axle_count = Number(args[11]);
    toll_charges.occupancy = Number(args[12]);
    toll_charges.protocol_type = Number(args[13]);
    toll_charges.vehicle_type = Number(args[14]);

   // Header record from file. In the future, check if some of these can be omitted
    toll_charges.fileType = "TOLL";
    toll_charges.sequence_number = Number(args[15]);
    toll_charges.business_date = args[16];
    toll_charges.source = args[17];
    toll_charges.destination = args[18];
    toll_charges.create_date = args[19];
    toll_charges.create_time = args[20];
    toll_charges.version = args[21];


    await stub.putState(toll_charges.tran_number.toString(), Buffer.from(JSON.stringify(toll_charges)));

    console.info('============= END : successfully added toll charges record ===========');
  }

  async addReconTollCharges(stub,args){
    console.info('============= END : adding Reconciled Toll charges record ===========');

    let recon_toll_charges = {};

    //Detailed record from file
    recon_toll_charges.tag_ID = args[0];
    recon_toll_charges.tran_number = Number(args[1]);
    recon_toll_charges.tran_amount = Number(args[2]);
    recon_toll_charges.entry_tran_date = args[3];
    recon_toll_charges.entry_tran_time = args[4];
    recon_toll_charges.entry_plaza = Number(args[5]);
    recon_toll_charges.entry_lane = Number(args[6]);
    recon_toll_charges.exit_tran_date = args[7];
    recon_toll_charges.exit_tran_time = args[8];
    recon_toll_charges.exit_plaza = Number(args[9]);
    recon_toll_charges.exit_lane = Number(args[10]);
    recon_toll_charges.axle_count = Number(args[11]);
    recon_toll_charges.occupancy = Number(args[12]);
    recon_toll_charges.protocol_type = Number(args[13]);
    recon_toll_charges.post_amt = Number(args[14]);
    recon_toll_charges.response_code = args[15];

     // Header record from file. In the future, check if some of these can be omitted
    recon_toll_charges.fileType = "RECONCILE";
    recon_toll_charges.sequence_number = Number(args[16]);
    recon_toll_charges.business_date = args[17];
    recon_toll_charges.source = args[18];
    recon_toll_charges.destination = args[19];
    recon_toll_charges.create_date = args[20];
    recon_toll_charges.create_time = args[21];
    recon_toll_charges.version = args[22];

    let key = 'R' + recon_toll_charges.tran_number.toString()

    await stub.putState(key, Buffer.from(JSON.stringify(recon_toll_charges)));

    console.info('============= END : successfully added Recon toll charges record ===========');


  }

  async addTagStatus(stub,args) {
   console.info('============= END : adding Tag status record ===========');

  let tag = {};
   //Detailed record from file
  tag.tag_ID = args[0];
  tag.account_id = Number(args[1]);
  tag.action_code = args[2];
  tag.tag_type = args[3];
  tag.subtype-a = args[4];
  tag.subtype-b = args[5];
  tag.subtype-c = args[6];
  tag.protocol_type = Number(args[7]);

  // Header record from file. In the future, check if some of these can be omitted
  tag.fileType = "TAGS"
  tag.action_code_header = args[8];
  tag.sequence_number = Number(args[9]);
  tag.business_date = args[10];
  tag.source = args[11];
  tag.destination = args[12];
  tag.create_date = args[13];
  tag.create_time = args[14];
  tag.version = args[15];

  await stub.putState(tag.account_id.toString(), Buffer.from(JSON.stringify(tag)));
  console.info('============= END : successfully added  tag status record ===========');


  }

  async addPaybyPlate(stub,args) {
    console.info('============= END : adding  pay by plate record ===========');

    let pay_by_plate = {};

    //Detail record
    pay_by_plate.license_plate = args[0];
    pay_by_plate.tran_number = Number(args[1]);
    pay_by_plate.state = args[2];
    pay_by_plate.tran_amt = Number(args[3]);
    pay_by_plate.entry_tran_date = args[4];
    pay_by_plate.entry_tran_time = args[5];
    pay_by_plate.entry_plaza = args[6];
    pay_by_plate.entry_lane = args[7];
    pay_by_plate.exit_tran_date = args[8];
    pay_by_plate.exit_tran_time = args[9];
    pay_by_plate.exit_plaza = args[10];
    pay_by_plate.exit_lane = args[11];
    pay_by_plate.axle_count = Number(args[12]);
    pay_by_plate.vehicle_type = Number(args[13]);

    // Header record from file. In the future, check if some of these can be omitted
    pay_by_plate.fileType = "PAYBYPLATE";
    pay_by_plate.sequence_number = Number(args[14]);
    pay_by_plate.business_date = args[15];
    pay_by_plate.source = args[16];
    pay_by_plate.destination = args[16];
    pay_by_plate.create_date = args[17];
    pay_by_plate.create_time = args[18];
    pay_by_plate.version = args[19];

    await stub.putState(pay_by_plate.tran_number.toString(), Buffer.from(JSON.stringify(pay_by_plate)));
    console.info('============= END : successfully added  pay by plate record ===========');


  }

  async addReconPaybyPlate(stub,args) {
   console.info('============= END : adding  recon pay by plate recon record ===========');

   let recon_pay_by_plate = {};

   //Detail record
   recon_pay_by_plate.license_plate = args[0];
   recon_pay_by_plate.tran_number = Number(args[1]);
   recon_pay_by_plate.state = args[2];
   recon_pay_by_plate.tran_amt = Number(args[3]);
   recon_pay_by_plate.entry_tran_date = args[4];
   recon_pay_by_plate.entry_tran_time = args[5];
   recon_pay_by_plate.entry_plaza = args[6];
   recon_pay_by_plate.entry_lane = args[7];
   recon_pay_by_plate.exit_tran_date = args[8];
   recon_pay_by_plate.exit_tran_time = args[9];
   recon_pay_by_plate.exit_plaza = args[10];
   recon_pay_by_plate.exit_lane = args[11];
   recon_pay_by_plate.axle_count = Number(args[12]);
   recon_pay_by_plate.post_amt = Number(args[13]);
   recon_pay_by_plate.recon_code = args[14];

   // Header record from file. In the future, check if some of these can be omitted
   recon_pay_by_plate.fileType = "PLATERECON";
   recon_pay_by_plate.sequence_number = Number(args[15]);
   recon_pay_by_plate.business_date = args[16];
   recon_pay_by_plate.source = args[17];
   recon_pay_by_plate.destination = args[18];
   recon_pay_by_plate.create_date = args[19];
   recon_pay_by_plate.create_time = args[20];
   recon_pay_by_plate.version = args[21];

   let key = 'R' + recon_pay_by_plate.tran_number.toString()

   await stub.putState(key, Buffer.from(JSON.stringify(recon_pay_by_plate)));
   console.info('============= END : successfully added  pay by plate recon record ===========');

  }

  async addLicensePlateStatus(stub,args) {
    console.info('============= END : adding license plate status record ===========');

    let license_plate_status = {};

    //Detail Record
    license_plate_status.account_id = Number(args[0]);
    license_plate_status.license_plate = args[1];
    license_plate_status.state = args[2];
    license_plate_status.action_code = args[3];
    license_plate_status.effective_start_date = args[4];
    license_plate_status.effective_end_date = args[5];
    license_plate_status.plate_type = args[6];
    license_plate_status.sub_type = args[7];

    // Header record from file. In the future, check if some of these can be omitted
    license_plate_status.fileType = "PLATES";
    license_plate_status.update_code = args[8];
    license_plate_status.sequence_number = Number(args[9]);
    license_plate_status.source = args[10];
    license_plate_status.destination = args[11];
    license_plate_status.create_date = args[12];
    license_plate_status.create_time = args[13];
    license_plate_status.version = args[14];

    let key = license_plate_status.account_id.toString() + license_plate_status.license_plate;

    await stub.putState(key, Buffer.from(JSON.stringify(license_plate_status)));
    console.info('============= END : successfully added license plate status record ===========');

  }


};

shim.start(new Chaincode());
