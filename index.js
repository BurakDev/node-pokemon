var fs = require('fs');

try {
	fs.accessSync(__dirname + '/build/PokemonGo.js');

	module.exports = require(__dirname + '/build/PokemonGo.js').default;
} catch (e) {
	console.log("Please build the project ! (using TypeScript compiler)");
}