var fibos = require('fibos');
var fs = require("fs");
var config = require('./config');
console.notice("start FIBOS seed node");


fibos.config_dir = config.config_dir;
fibos.data_dir = config.data_dir;

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);


fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false
});


fibos.load("net", {
	"p2p-peer-address": config.p2p_peer_address,
	"max-clients": 0,
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

var chain_config = {
	"contracts-console": true,
	'chain-state-db-size-mb': 8 * 1024
};

if (!fs.exists(fibos.data_dir) && !fs.exists(fibos.config_dir)) {
	chain_config['genesis-json'] = "genesis.json";
}

//1.7.1.4 for eth fox
fibos.load("ethash");

fibos.load("producer", {
	'max-transaction-time': 3000
});

fibos.load("chain", chain_config);
fibos.load("chain_api");


fibos.start();