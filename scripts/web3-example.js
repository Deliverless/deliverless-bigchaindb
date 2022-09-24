import Web3 from 'web3';
import bip39 from 'bip39';
import base64 from 'base-64';
import BigchainDb from "./bigchaindb-orm.js";
import * as abiIndex from '../abi/index.js';
import * as contracts from '../contracts/index.js';
const abi = abiIndex.default;
const contractObjects = contracts.default;

// intialize the bigchaindb orm just for keypair
// TODO: remove this and use web3 to generate keypair (requires testing)
const bigchaindb = new BigchainDb("http://24.150.93.243");
const seed = bip39.mnemonicToSeedSync('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat').slice(0, 32);
const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed);

// *** REFERENCE objects dir: deliverless-chainlink/adapters/bigchaindb-utils/models ***

// create a new user using web3
const web3 = new Web3('http://24.150.93.243:8546');
// get the account with the private key
const account = web3.eth.accounts.privateKeyToAccount('0x76a2363754bb83ad1ce289c28974b37a02a82f63f16c82f34ecd5615bb13ffc9');
// get the balance of the account 
const balance = await web3.eth.getBalance(account.address);
console.log('account loaded successfuly and balance is:', balance);
// bigchaindb address '../contracts/bigchaindb.json'
const address = contractObjects.bigchaindb.address;
// initialize the contract
const contractBigchaindb = new web3.eth.Contract(abi.abiBigchaindb, address);


// creates new object in the database
const createNewObject = async (modelName, metadataJson) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods.requestNewObject(modelName, JSON.stringify(metadataJson), "").send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt); console.log('requestId', requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId); console.log('response', response);
}

// TODO: fix data limit
// grab all objects in the database is not working because of size of the data (in-progress)
const getObjectById = async (modelName, assetId) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods.requestGetObject(modelName, assetId, "").send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt); console.log('requestId', requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId); console.log('response', response);
}

// TODO: fix data limit
// find object(s) in the database by metadata (limited to 1 for now)
const findObjectByMetadata = async (modelName, metadataJson) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods.requestFindObject(modelName, JSON.stringify(metadataJson), 1, "").send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt); console.log('requestId', requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId); console.log('response', response);
}

// append metadata to object(asset) in the database
const updateObject = async (modelName, assetId, metadataJson) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods.requestAppendObject(modelName, assetId, JSON.stringify(metadataJson), "").send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt); console.log('requestId', requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId); console.log('response', response);
}

// burn object from the database
const deleteObject = async (modelName, assetId) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods.requestBurnObject(modelName, assetId).send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt); console.log('requestId', requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId); console.log('response', response);
}

// Helper Functions

const getRequestId = (receipt) => {
  return receipt.events.ChainlinkRequested.returnValues['id'];
}

const requestResponse = async (requestId) => {
  const operatorAddress = contractObjects.operator.address;
  const operatorContract = new web3.eth.Contract(abi.abiOperator, operatorAddress);
  const events = await new Promise((resolve, reject) => {
    setTimeout(async () => {
      for (let i = 0; i < 60/0.3; i++) {
        const results = await operatorContract.getPastEvents(
          'DeliverlessRequest',
          {
            fromBlock: 0,
            filter: { requestId: String(requestId) } 
          }
        );
        if (results.length > 0) {
          resolve(results);
          break;
        }
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 300);
        });
      }
      reject();
    }, 1000);
  });

  if (events.length > 0) {
    const event = events.find(e => e.returnValues.requestId === requestId);
    const data = Buffer.from(event.returnValues.data.slice(2), 'hex').toString('ascii');
    const extractText = data.match(/{.*}/g);
    const parsedResponse = JSON.parse(extractText);
    return parsedResponse;
  } else {
    {}
  }
}

// specify object properties 
// *** REFERENCE deliverless-chainlink/adapters/bigchaindb-utils/models ***
const metadataObject = {
  "role": "admin",
  "firstName": "marcin",
  "lastName": "koziel",
  "birthday": "1990-01-01",
  "email": "koziel@sheridancollege.ca",
  "addresses": [],
  "phone": "647-123-4567",
  "orderIds": [],
  "encoded": "sheridanuser",
  "images": [],
  "keypair": keypair
}


createNewObject('user', metadataObject);
// getObjectById('user', 'id:global:user:c1552c51-bccc-4ff7-ac60-a4b7cd78e40e');
// findObjectByMetadata('user', metadataObject);
// updateObject('user', 'id:global:user:835249bc-14d3-4210-a10f-5abacdd9b4d6', metadataObject);
// deleteObject('user', 'id:global:user:c1552c51-bccc-4ff7-ac60-a4b7cd78e40e');