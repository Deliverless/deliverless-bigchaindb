import * as modelObjects from "../models/index.js";
import driver from 'bigchaindb-driver'
import bigchaindbOrm from "bigchaindb-orm";
const models = modelObjects.default;
const Orm = bigchaindbOrm.default;

export default class BigchainDb {

  models = modelObjects.default;
  Orm = bigchaindbOrm.default;

  constructor(host, debug=false) {
    this.bdbOrm = new Orm(`${host}:9984/api/v1/`);
    this.debug = debug;
  }

  async createObject(model, data, keypair, debug=this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]); }
    if (model && data && keypair) {
      // console.log("creating object", model, data, keypair);
      // console.log("bdbOrm", this.bdbOrm.models[model]);
      this.bdbOrm.models[model]
        .create({
          keypair: keypair,
          data: data,
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
          if (debug) {
            console.log(asset.id);
          }
        });
    } else {
      console.log("model and data are required");
    }
  };

  async getObjectsById(model, assetId, debug=this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]); }
    // get all objects with retrieve()
    // or get a specific object with retrieve(object.id)
    this.bdbOrm.models[model].retrieve(assetId).then((assets) => {
      // assets is an array of myModel
      if (debug) console.log(assets.map((asset) => asset.id));
      return assets;
    });
  };

  async getObjectsByMetadata(model, metadata, debug=this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]); }
    const search_meta = await this.bdbOrm.connection.conn.searchMetadata(metadata);
    const res_objects = await Promise.all(search_meta.map(async (meta) => {
      const assets = await this.bdbOrm.models[model].retrieve(meta.id);
      if (assets.length > 0) { console.log(`asset: ${assets[0]}`); return assets[0]; 
      } else { console.log("No asset(s) found") }
    }));
    return res_objects;
  };

  async appendToObject(model, assetId, data, keypair, debug=this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]); }
    if (model && assetId && data && keypair) {
      // get the asset
      this.bdbOrm.models[model].retrieve(assetId).then((assets) => {
        // append to the asset
        if (assets.length > 0) {
          if (debug) console.log(`asset retrieved:`, assets[0]);
          assets[0].append({
            toPublicKey: keypair.publicKey,
            keypair: keypair,
            data: data,
          });
        }
      });
    } else {
      console.log("The following args are missing: " % (model, assetId, data, keypair));
    }
  };

  async burnObject(model, assetId, keypair, debug=this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]); }
    if (model && assetId && keypair) {
      // create an asset with Alice as owner
      this.bdbOrm.models[model].retrieve(assetId).then((assets) => {
          // lets burn the asset by assigning to a random keypair
          // since will not store the private key it's infeasible to redeem the asset
          return assets[0].burn({ keypair: keypair });
      }).then((burnedAsset) => { if (debug)  console.log(burnedAsset.data); });
    } else { console.log("The following args are missing: " % (model, assetId, keypair)); }
  };

}