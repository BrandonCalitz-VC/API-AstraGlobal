const ExpressBrute = require("express-brute");


const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
  freeRetries: 10,
  minWait: 1000,
  maxWait: 1000,
});
const lightbruteforce = new ExpressBrute(store, {
  freeRetries: 100, 
  minWait: 15 * 60 * 1000, 
  maxWait: 60 * 60 * 1000, 
  lifetime: 15 * 60,
});


module.exports = {bruteforce, lightbruteforce};