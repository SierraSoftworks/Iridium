var Mocha = require("mocha");
var fs = require("fs");
var path = require("path");
var common = require("./common");
var logging = require("./logging");
var location = path.normalize(path.join(__dirname, "integration"));
var mocha = new Mocha({
	reporter: 'gitlablist-mocha'
});

if (common.hasConfig() === 'not-found') {
	logging.error("**test/config.js** missing. Take a look at **test/config.example.js**");
	process.exit(1);
}

runTests();

function runTests() {
	fs.readdirSync(location).filter(function (file) {
		return file.substr(-3) === '.js';
	}).forEach(function (file) {
		mocha.addFile(
			path.join(location, file)
		);
	});

	mocha.run(function (failures) {
		process.exit(failures);
	});
}
