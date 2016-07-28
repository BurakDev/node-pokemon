var fs = require('fs');

try {
	fs.accessSync('./build/PokemonGo.js');

	var PokemonGo = require('./build/PokemonGo.js');
	
	return PokemonGo;
} catch (e) {
	console.log("Please build the project ! (using TypeScript compiler)");
}