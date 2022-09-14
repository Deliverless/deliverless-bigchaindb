import userModel from "../models/user.json" assert { type: "json" };
// import bigchaindb-orm
import bigchaindb from "bigchaindb-orm";
const Orm = bigchaindb.default;
// connect to BigchainDB
const bdbOrm = new Orm("http://24.150.93.243:9984/api/v1/");

bdbOrm.define("user", userModel);
// 8dbFB2F32D24a41fb3219aE027e5d50F488C75c9 to base58

const address = "8dbFB2F32D24anet41fb3219aE027e5d50F488C75c9";
const addressBase58 = "8dbFB2F32D24a41fb3219aE027e5d50F488C75c9";

const keypair = {
  publicKey: "8dbFB2F32D24a41fb3219aE027e5d50F488C75c9",
  privateKey: "8EmKudhRxZSpmZQ8aDzhDdfXrA2j2QsWGj2fbHQ5Lmdp",
};

const aliceKeypair = new bdbOrm.driver.Ed25519Keypair();

const createUser = async () => {
  // 8dbFB2F32D24a41fb3219aE027e5d50F488C75c9 the defined models in our bdbOrm we create an asset with Alice as owner

  bdbOrm.models.user
    .create({
      keypair: keypair,
      data: { firstName: "Marcin" },
    })
    .then((asset) => {
      /*
        asset is an object with all our data and functions
        asset.id equals the id of the asset
        asset.data is data of the last (unspent) transaction
        asset.transactionHistory gives the full raw transaction history
        Note: Raw transaction history has different object structure then
        asset. You can find specific data change in metadata property.
      */
      console.log(asset.id);
    });
};

// // get all objects with retrieve()
// // or get a specific object with retrieve(object.id)
// bdbOrm.models.myModel.retrieve().then((assets) => {
//   // assets is an array of myModel
//   console.log(assets.map((asset) => asset.id));
// });

// // create an asset with Alice as owner
// bdbOrm.models.myModel
//   .create({
//     keypair: aliceKeypair,
//     data: { key: "dataValue" },
//   })
//   .then((asset) => {
//     // lets append update the data of our asset
//     // since we use a blockchain, we can only append
//     return asset.append({
//       toPublicKey: aliceKeypair.publicKey,
//       keypair: aliceKeypair,
//       data: { key: "updatedValue" },
//     });
//   })
//   .then((updatedAsset) => {
//     // updatedAsset contains the last (unspent) state
//     // of our asset so any actions
//     // need to be done to updatedAsset
//     console.log(updatedAsset.data);
//   });

// // create an asset with Alice as owner
// bdbOrm.models.myModel
//   .create({
//     keypair: aliceKeypair,
//     data: { key: "dataValue" },
//   })
//   .then((asset) => {
//     // lets burn the asset by assigning to a random keypair
//     // since will not store the private key it's infeasible to redeem the asset
//     return asset.burn({
//       keypair: aliceKeypair,
//     });
//   })
//   .then((burnedAsset) => {
//     // asset is now tagged as "burned"
//     console.log(burnedAsset.data);
//   });

// export { createUser };
