import bip39 from 'bip39';
import Web3 from 'web3';

import * as abiIndex from '../abi/index.js';
import * as contracts from '../contracts/index.js';
import BigchainDb from './bigchaindb-orm.js';

const abi = abiIndex.default;
const contractObjects = contracts.default;

// intialize the bigchaindb orm just for keypair
// TODO: remove this and use web3 to generate keypair (requires testing)
const bigchaindb = new BigchainDb("http://24.150.93.243");
const seed = bip39
  .mnemonicToSeedSync(
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
  )
  .slice(0, 32);
const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed);

// *** REFERENCE objects dir: deliverless-chainlink/adapters/bigchaindb-utils/models ***

// create a new user using web3
const web3 = new Web3("http://24.150.93.243:8546");
// get the account with the private key
const account = web3.eth.accounts.privateKeyToAccount(
  "0xfc87912089fe0099ea86d3819cb18af6cde579eea93a1627d31039ca24eb02d1"
);
// get the balance of the account
const balance = await web3.eth.getBalance(account.address);
console.log("account loaded successfuly and balance is:", balance);
// bigchaindb address '../contracts/bigchaindb.json'
const address = contractObjects.bigchaindb.address;
// initialize the contract
const contractBigchaindb = new web3.eth.Contract(abi.abiBigchaindb, address);

// creates new object in the database
const createNewObject = async (modelName, metadataJson) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods
    .requestNewObject(modelName, JSON.stringify(metadataJson), "")
    .send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt);
  console.log("requestId", requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId);
  console.log("response", response);
};

// TODO: fix data limit
// grab all objects in the database is not working because of size of the data (in-progress)
const getObjectById = async (modelName, assetId) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods
    .requestGetObject(modelName, assetId, "")
    .send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt);
  console.log("requestId", requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId);
  console.log("response", response);
};

// TODO: fix data limit
// find object(s) in the database by metadata (limited to 1 for now)
const findObjectByMetadata = async (modelName, metadataJson, limit = 1) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods
    .requestFindObject(modelName, JSON.stringify(metadataJson), limit, "")
    .send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt);
  console.log("requestId", requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId);
  console.log("response", response);
};

// append metadata to object(asset) in the database
const updateObject = async (modelName, assetId, metadataJson) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods
    .requestAppendObject(modelName, assetId, JSON.stringify(metadataJson), "")
    .send({ from: account.address, gas: 0 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt);
  console.log("requestId", requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId);
  console.log("response", response);
};

// burn object from the database
const deleteObject = async (modelName, assetId) => {
  // call(send) function within smart contract
  const receipt = await contractBigchaindb.methods
    .requestBurnObject(modelName, assetId)
    .send({ from: account.address, gas: 3000000 });
  // requestId from Chainlink
  const requestId = getRequestId(receipt);
  console.log("requestId", requestId);
  // return response from Chainlink
  const response = await requestResponse(requestId);
  console.log("response", response);
  
};

// Helper Functions

const getRequestId = (receipt) => {
  return receipt.events.ChainlinkRequested.returnValues["id"];
};

const requestResponse = async (requestId) => {
  const operatorAddress = contractObjects.operator.address;
  const operatorContract = new web3.eth.Contract(
    abi.abiOperator,
    operatorAddress
  );
  const events = await new Promise((resolve, reject) => {
    setTimeout(async () => {
      for (let i = 0; i < 60 / 0.3; i++) {
        const results = await operatorContract.getPastEvents(
          "DeliverlessResponse",
          {
            fromBlock: 0,
            filter: { requestId: String(requestId) },
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
    const event = events.find((e) => e.returnValues.requestId === requestId);
    const data = Buffer.from(event.returnValues.data.slice(2), "hex").toString(
      "ascii"
    );
    const extractText = data.match(/{"jobRunID":.*}/g);
    const parsedResponse = JSON.parse(extractText);
    parsedResponse.data = JSON.parse(parsedResponse.data);
    return parsedResponse;
  } else {
    return null;
  }
};

// specify object properties
// *** REFERENCE deliverless-chainlink/adapters/bigchaindb-utils/models ***
const burritoBoyz = {
  images: [
    {
      "alt": "main",
      "url": "https://images.squarespace-cdn.com/content/v1/578ce85a29687f705d94f1a2/1584198889602-6RR8CW7Q9DVW19Q25Z0J/logo.png?format=1000w",
    },
    {
      "alt": "banner",
      "url": "https://images.squarespace-cdn.com/content/v1/578ce85a29687f705d94f1a2/1523887146984-OOLAR9TU22ZUTWWL6EBT/30087303_801083566749104_7886126611966197760_n.jpg?format=1000w",
    },
  ],
};

const burgerKing = {
  name: "Burger King",
  cuisine: "Fast Food",
  address: {
    type: "",
    local: "Oakville",
    region: "ON",
    country: "CA",
    postal: "L6K 2G7",
    street: "240 Wyecroft Road",
    unit: "",
    lat: "43.44566",
    lon: "-79.69587",
  },
  hours: {
    sunday: "14:30-04:00",
    monday: "11:00-01:00",
    tuesday: "11:00-01:00",
    wednesday: "11:00-01:00",
    thursday: "11:00-01:00",
    friday: "11:00-01:00",
    saturday: "14:30-04:00",
  },
  itemIds: [
    'id:global:item:3cb3a7ce-3184-4927-aae9-e2934febcfbf',
    'id:global:item:7e378e76-ed18-48a8-9009-cdd55960a5e0',
    'id:global:item:63330d92-4f48-4a12-9994-dda8f1de1334',
    'id:global:item:6f927077-5c71-4a31-b781-5be1089033c3',
    'id:global:item:3e52a2e1-4284-4628-9b96-f547bb699738',
    'id:global:item:eef17eaa-265e-4884-8885-724955cd56d5',
    'id:global:item:1de4e1fa-9166-4c2a-80a4-52a9fa26178c',
    'id:global:item:a5e41fd7-d9fb-4135-9f12-84faf901c903',
    'id:global:item:c05e1151-3589-4d78-a661-1a8282cc4bb9',
  ],
  rating: "3.5",
  reviewIds: [],
  images: [
    {
      "alt": "main",
      "url": "https://en.wikipedia.org/wiki/Burger_King#/media/File:Burger_King_2020.svg",
    },
    {
      "alt": "banner",
      "url": "https://images.squarespace-cdn.com/content/v1/578ce85a29687f705d94f1a2/1533268082201-46YNRM7B1AM67XM8MMKM/OrderHereSign.jpg?format=1500w",
    },
  ],
  keypair: keypair,
};

const burgerKingFries = {
  "restaurantId": 'id:global:restaurant:9df3c400-e0cd-4b47-9b34-b3e2acbd4c53',
  "name": "Burrito",
  "description": "",
  "size": "",
  "category": "burritos",
  "images": [
    {
      "alt": "main",
      "url": "https://tb-static.uber.com/prod/image-proc/processed_images/bfd9d6916d0a2d3afdd41bcf2ce247ac/859baff1d76042a45e319d1de80aec7a.jpeg",
    },
  ],
  "options": [],
  "price": "14.35",
  "quantity": "",
  "discount": "",
  "isPickupOnly": false,
  "isAvailable": true,
  "keypair": keypair,
}

const burgerUpdate = {
  "menu": {
    "0": {
      "name": "Appetizer",
      "itemIds": {
      }
    },
    "1": {
      "name": "Beverages",
      "itemIds": {
      }
    },
  }
}

const burgerKingBanner = {
  images : [
    {
        "alt": "main",
        "url": "https://tb-static.uber.com/prod/image-proc/processed_images/ad0f16bde50948ac350fdf6f008e7250/859baff1d76042a45e319d1de80aec7a.jpeg"
    },
    {
        "alt": "banner",
        "url": "https://bloximages.newyork1.vip.townnews.com/newsrecord.org/content/tncms/assets/v3/editorial/c/01/c01d3918-3a75-11ed-ac63-07ebfa395c8e/632c5b57d523e.image.jpg?resize=1600%2C946"
    }
]
}

// const itemUpdate = {
//   options: [
//     {
//       name: "Add Extra Protein",
//       options: [
//         {
//           name: "Choose Protein",
//           isOptional: true,
//           limit: 1,
//           options: [
//             {
//               name: "Chicken",
//               price: 2.00,
//             },
//             {
//               name: "Beef",
//               price: 2.00,
//             },
//             {
//               name: "Pork",
//               price: 2.00,
//             }
//           ]
//         }
//       ]
//     },
//     {
//       name: "Modify your Burger",
//       options: [
//         {
//           name: "Remove Ingredients",
//           isOptional: true,
//           limit: 1,
//           options: [
//             {
//               name: "Lettuce",
//               price: -1.00,
//             },
//             {
//               name: "Tomato",
//               price: -1.00,
//             },
//             {
//               name: "Onion",
//               price: -1.00,
//             }
//           ]
//         },
//         {
//           name: "Add Ingredients",
//           isOptional: true,
//           limit: 1,
//           options: [
//             {
//               name: "Lettuce",
//               price: 1.00,
//             },
//             {
//               name: "Tomato",
//               price: 1.00,
//             },
//             {
//               name: "Onion",
//               price: 1.00,
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }

const itemDescription = {
  "options": [
  {
      "name": "Modify your Burger",
      "options": [
          {
              "name": "Add Ingredients",
              "isOptional": true,
              "limit": 1,
              "options": [
                  {
                      "name": "Lettuce",
                      "price": 1
                  },
                  {
                      "name": "Tomato",
                      "price": 1
                  },
                  {
                      "name": "Onion",
                      "price": 1
                  }
              ]
          },
          {
              "name": "Remove Ingredients",
              "isOptional": true,
              "limit": 1,
              "options": [
                  {
                      "name": "Lettuce",
                      "price": -1
                  },
                  {
                      "name": "Tomato",
                      "price": -1
                  },
                  {
                      "name": "Onion",
                      "price": -1
                  }
              ]
          }
      ]
  },
  {
      "name": "Add Extra Proteinn",
      "options": [
          {
              "name": "Choose a Protein",
              "isOptional": true,
              "limit": 1,
              "options": [
                  {
                      "name": "Chicken",
                      "price": 3
                  },
                  {
                      "name": "Beef",
                      "price": 2
                  },
                  {
                      "name": "Pork",
                      "price": 2
                  }
              ]
          }
      ]
  }
]
}

// 'id:global:item:7e378e76-ed18-48a8-9009-cdd55960a5e0'
// 'id:global:item:63330d92-4f48-4a12-9994-dda8f1de1334'
// 'id:global:item:6f927077-5c71-4a31-b781-5be1089033c3'

const itemUpdate = {
  images: [{
    "alt": "main",
    "url": "https://tb-static.uber.com/prod/image-proc/processed_images/ad0f16bde50948ac350fdf6f008e7250/859baff1d76042a45e319d1de80aec7a.jpeg"
  }]
}

const restPhone = {
  "phone": "(905) 842-1681"
}

// createNewObject("item", burgerKingFries);
// getObjectById('Item', "id:global:item:7e378e76-ed18-48a8-9009-cdd55960a5e7");
// findObjectByMetadata("order", {status: 'Complete'}, 1);
// findObjectByMetadata("item", { restaurantId: 'id:global:restaurant:8e8c2151-66cf-4e01-aead-0502813d6de6' }, 0);
updateObject("Restaurant", "id:global:restaurant:25aaf9af-2c0b-4b17-9939-b222eaee89e5", restPhone);
// deleteObject('Item', 'id:global:Item:2b5bc1c4-15c1-4bcf-b9ba-f14b87df654a');