import Web3 from 'web3';
import * as abiIndex from '../abi/index.js';
import * as contracts from '../contracts/index.js';
const abi = abiIndex.default;
const contractObjects = contracts.default;

// *** ref objects dir: deliverless-chainlink/adapters/bigchaindb-utils/objects ***

// create a new user using web3
const web3 = new Web3('http://24.150.93.243:8546');
// get the account with the private key
const account = web3.eth.accounts.privateKeyToAccount('0x76a2363754bb83ad1ce289c28974b37a02a82f63f16c82f34ecd5615bb13ffc9');
// get the balance of the account 
const balance = await web3.eth.getBalance(account.address);
console.log('account loaded successfuly and balance is:', balance);
// bigchaindb address '../contracts/bigchaindb.json'
const address = contractObjects.bigchaindb.address;


// creates new object in the database
const createNewObject = async (modelName, metadataJson) => {
  // initialize the contract
  const contract = new web3.eth.Contract(abi.abiBigchaindb, address);
  // call(send) function within smart contract
  const result = await contract.methods.requestNewObject(modelName, JSON.stringify(metadataJson), "").send({ from: account.address, gas: 3000000 });
  // print the result
  printResult(result, contract);
}

// TODO: fix data limit
// grab all objects in the database is not working because of size of the data (in-progress)
const getObjectById = async (modelName, assetId) => {
  // call function within smart contract
  const contract = new web3.eth.Contract(abi.abiBigchaindb, address);
  // call(send) function within smart contract
  const result = await contract.methods.requestGetObject(modelName, assetId, "").send({ from: account.address, gas: 3000000 });
  // print the result
  printResult(result, contract);
}

// TODO: fix data limit
// find object(s) in the database by metadata (limited to 1 for now)
const findObjectByMetadata = async (modelName, metadataJson) => {
  // call function within smart contract
  const contract = new web3.eth.Contract(abi.abiBigchaindb, address);
  // call(send) function within smart contract
  const result = await contract.methods.requestFindObject(modelName, JSON.stringify(metadataJson), 1, "").send({ from: account.address, gas: 3000000 });
  // print the result
  printResult(result, contract);
}

// append metadata to object(asset) in the database
const updateObject = async (modelName, assetId, metadataJson) => {
  // call function within smart contract
  const contract = new web3.eth.Contract(abi.abiBigchaindb, address);
  // call(send) function within smart contract
  const result = await contract.methods.requestAppendObject(modelName, assetId, JSON.stringify(metadataJson), "").send({ from: account.address, gas: 3000000 });
  // print the result
  printResult(result, contract);
}

// burn object from the database
const deleteObject = async (modelName, assetId) => {
  // call function within smart contract
  const contract = new web3.eth.Contract(abi.abiBigchaindb, address);
  // call(send) function within smart contract
  const result = await contract.methods.requestBurnObject(modelName, assetId).send({ from: account.address, gas: 3000000 });
  // print the result
  printResult(result, contract);
}

// Helper Functions

const printResult = async (receipt, contract) => {
  const lastBlockNumber = receipt.blockNumber;
  const newAccountResult = await new Promise((resolve, reject) => {
    setTimeout(async () => {
      for (let i = 0; i < 60; i++) {
        const results = await contract.getPastEvents(
          'RequestEvent',
          {
            fromBlock: lastBlockNumber,
            toBlock: 'latest',
            // filter: { _requester: account.address }
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

  if (newAccountResult.length > 0) {
    const data = newAccountResult[0].returnValues.data;
    const parsedData = JSON.parse(data);
    console.log('parsedData', parsedData);
  }
}

// specify object properties 
// *** REFERENCE deliverless-chainlink/adapters/bigchaindb-utils/objects ***
const metadataObject = {
  "encoded": "encodeduserpass",
};


// createNewObject('user', metadataObject);
// getObjectById('user', 'id:global:user:c1552c51-bccc-4ff7-ac60-a4b7cd78e40e');
// findObjectByMetadata('user', metadataObject);
// updateObject('user', 'id:global:user:c1552c51-bccc-4ff7-ac60-a4b7cd78e40e', metadataObject);
// deleteObject('user', 'id:global:user:c1552c51-bccc-4ff7-ac60-a4b7cd78e40e');