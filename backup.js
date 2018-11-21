const coroutine = require('coroutine');
const config = require('./config');
const http = require("http");
const fs = require("fs");

let p;

function runSeed() {
	p = process.start('fibos', ['seed.js']);
}

function endSeed() {
	if (p) {
		console.log('kill fibos');
		p.kill(15);
	}
	console.log('sleep 1 s');
	coroutine.sleep(1000);
}

if (!fs.exists(config.backup_dir)) {
	fs.mkdir(config.backup_dir);
}

runSeed();
syncData();

function syncData() {
	console.log("start now ,waiting 10 s")
	coroutine.sleep(10 * 1000);
	const rep = http.post("http://127.0.0.1:8870/v1/chain/get_info", {
		json: {}
	});
	const a = rep.json();

	console.log("now head_block_num==> ", a.head_block_num);

	endSeed();
	console.log("taring =====>");

	const filename = "data_" + a.head_block_num + ".tar.gz";

	process.run('tar', ['-zcvf', filename, config.data_dir]);

	console.log("mving  =====>" + filename + " " + config.backup_dir + "/" + filename);
	process.run('mv', [filename, config.backup_dir + "/" + filename]);

	console.log("waiting 60*1000 s");
	coroutine.sleep(10 * 1000);
	let files = fs.readdir(config.backup_dir);

	files.sort((a, b) => {
		return parseInt(a.split("_")[1]) > parseInt(b.split("_")[1]) ? -1 : 1;
	});
	const diffnum = files.length - config.limit;
	console.log(" files: ", files.length, " limit==>", config.limit, " diffnum==>", diffnum);
	if (diffnum > 0) {
		const rfarr = files.slice(-diffnum);
		rfarr.forEach((fname) => {
			fs.unlink(config.backup_dir + "/" + fname);
		});
	}
	console.log("restart   sync");
	runSeed();
	coroutine.sleep(60 * 1000);
	syncData()
}