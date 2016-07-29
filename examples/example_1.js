var PokemonGo = require('../index');

var player = new PokemonGo();

player.login("account@gmail.com", "password", 0, function(err){
	if(err)
		console.log(err);

	console.log("Logged in !");
});