import { sh, cli } from "tasksfile";
import { createUser, getUsers, searchUsersByMetadata, appendUserData, burnUser } from "./scripts/user.js";


cli({
  createUser,
  getUsers,
  searchUsersByMetadata,
  appendUserData,
  burnUser,
})