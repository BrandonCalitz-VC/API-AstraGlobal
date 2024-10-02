const ExpressBrute = require("express-brute");


var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

module.exports = bruteforce;