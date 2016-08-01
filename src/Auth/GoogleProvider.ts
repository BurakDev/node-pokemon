import Provider from './Provider';
import GoogleOauth = require('gpsoauthnode');
import PokemonGo from '../PokemonGo';

export default class GoogleProvider extends Provider {
	public static androidId: string = "9774d56d682e549c";
	public static oauthService: string = "audience:server:client_id:848232511240-7so421jotr2609rmqakceuu1luuq0ptb.apps.googleusercontent.com";
	public static app: string = "com.nianticlabs.pokemongo";
	public static clientSig: string = "321187995bc7cdc2b5fc91b11a96e2baa8602c62";

	public login(username: string, password: string, self: PokemonGo, callback: (err, token: string) => void): void {
		let google: GoogleOauth = new GoogleOauth();
		google.login(username, password, GoogleProvider.androidId, function(err, data: { androidId: string, masterToken: string }) {
			if (data) {
				google.oauth(username, data.masterToken, data.androidId, GoogleProvider.oauthService, GoogleProvider.app, GoogleProvider.clientSig, function(err, token) {
					if (err)
						return callback(err, null);

					self.setToken(token.Auth);
					callback(null, token.Auth);
				});
			} else {
				callback(err.statusCode == 403 ? "Invalid google credentials" : "Error on Google (" + err.statusCode + ")", null);
			}
		});
	}
}