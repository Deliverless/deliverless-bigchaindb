import { sh, cli } from "tasksfile";
import bigdb from 'bigchaindb-orm';
const Orm = bigdb.default;
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()


console.log(process.env.APP_VAR)

import * as User from "./models/user.json" assert {type: 'json'};

let bdbOrm = null;

const hello = () => {
  sh("echo", "Hello World");
};

const init = () => {
  // connect to BigchainDB
  const bdbOrm = new Orm("http://24.150.93.243:9984/api/v1/");
  bdbOrm.define("user", User);
  // create a public and private key for Alice
  const aliceKeypair = new bdbOrm.driver.Ed25519Keypair();
};

cli({
  hello,
  init,
})