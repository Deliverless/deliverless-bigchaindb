import BigchainDb from "./bigchaindb-orm.js";
import bip39 from "bip39";

const bigchaindb = new BigchainDb("http://24.150.93.243");

// DO NOT CHANGE THIS
const seed = bip39.mnemonicToSeedSync("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat").slice(0, 32);
const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed);

// *** ONLY replace data within args for createUser function  ***

/**
 * Create a new user object in the database
 * @date 2022-09-14
 */
const createUser = async () => {
  await bigchaindb.createObject('user', { firstName: 'Marcin', lastName: "Koziel", encoded: "marcinkoziel123" }, keypair, true);
}

/**
 * Get all users in the database (top 10 seemingly - unless specified unqique id, then expect one result)
 * @date 2022-09-14
 */
const getUsers = async () => {
  await bigchaindb.getObjectsById('user', "id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f", true);
}

/**
 * Search for users by metadata
 * @date 2022-09-14
 */
const searchUsersByMetadata = async () => {
  await bigchaindb.getObjectsByMetadata('user', "marcinkoziel123");
}

/**
 * Append data to a user object
 * @date 2022-09-14
 */
const appendUserData = async () => {
  await bigchaindb.appendToObject('user', 'id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f', { firstName: 'Koziel', lastName: "Marcin" }, keypair, true);
}

/**
 * Burn a user object
 * @date 2022-09-14
 */
const burnUser = async () => {
  await bigchaindb.burnObject('user', 'id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f', keypair, true);
}

export { createUser, getUsers, searchUsersByMetadata, appendUserData, burnUser };
