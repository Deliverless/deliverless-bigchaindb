import { sh, cli } from "tasksfile";
import Orm from "./modules/js-driver-orm-master/src/index.js";

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
  aliceKeypair = new bdbOrm.driver.Ed25519Keypair();
};

cli({
  hello,
  init,
})