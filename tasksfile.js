import { sh, cli } from "tasksfile";
import { createUser, getUsers, searchUsersByMetadata, appendUserData, burnUser } from "./scripts/user.js";

// *** In terminal, run `npm run tasks -- createUser` to create a new user (data is specified in user.js) ***

cli({
  createUser,
  getUsers,
  searchUsersByMetadata,
  appendUserData,
  burnUser,
})