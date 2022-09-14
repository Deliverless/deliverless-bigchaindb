import { sh, cli } from "tasksfile";
import BigchainDb from "./scripts/bigchaindb-orm.js";
import bip39 from "bip39";

const bigchaindb = new BigchainDb("http://24.150.93.243");

const seed = bip39.mnemonicToSeedSync("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat").slice(0, 32);
const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed);

const createUser = async () => {
  await bigchaindb.createObject('user', { firstName: 'Marcin', lastName: "Koziel", encoded: "marcinkoziel123" }, keypair, true);
}

const getUsers = async () => {
  const users = await bigchaindb.getObjectsById('user', undefined, true);
  console.log("users", users);
}

const searchUsersByMetadata = async () => {
  const results = await bigchaindb.getObjectsByMetadata('user', "marcinkoziel123");
  console.log("results", results);
}

const appendUserData = async () => {
  await bigchaindb.appendToObject('user', 'id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f', { firstName: 'Koziel', lastName: "Marcin" }, keypair, true);
}

const burnUser = async () => {
  await bigchaindb.burnObject('user', 'id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f', keypair, true);
}

cli({
  createUser,
  getUsers,
  searchUsersByMetadata,
  appendUserData,
  burnUser,
})