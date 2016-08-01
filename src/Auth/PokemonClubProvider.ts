import Provider from './Provider';
import PokemonGo from '../PokemonGo';
import request = require('request');

export default class PokemonClubProvider extends Provider {
	public static loginUrl: string = "https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize";
	public static loginOauth: string = "https://sso.pokemon.com/sso/oauth2.0/accessToken";

	public login(username: string, password: string, self: PokemonGo, callback: (err, token: string) => void): void {
		let options = {
			url: PokemonClubProvider.loginUrl,
			headers: {
				'User-Agent': 'niantic'
			}
		};

		request.get(options, function(err, response, body) {
			if(err)
				return callback(err, null);

			if(body.trim().indexOf('<') === 0)
				return callback(new Error('Invalide response from PTC server'), null);

			let data:;
			try {
				data = JSON.parse(body);
			} catch(err) {
				return callback(err, null);
			}

			let options = {
				url: PokemonClubProvider.loginUrl,
				form: {
					'lt': data.lt,
					'execution': data.execution,
					'_eventId': 'submit',
					'username': username,
					'password': password
				},
				headers: {
					'User-Agent': 'niantic'
				}
			};

			request.post(options, function(err, response, body) {
				if(err)
					return callback(err, null);

				if(body) {
					let parsedBody = JSON.parse(body);
					if(parsedBody.errors && parsedBody.errors.length !== 0)
						return callback(new Error('Error logging in: ' + parsedBody.errors[0]), null);
				}

				let ticket = response.headers['location'].split('ticket=')[1];

				let options = {
					url: PokemonClubProvider.loginOauth,
					form: {
						'client_id': 'mobile-app_pokemon-go',
						'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
						'client_secret': 'w8ScCUXJQc6kXKw8FiOhd8Fixzht18Dq3PEVkUCP5ZPxtgyWsbTvWHFLm2wNY0JR',
						'grant_type': 'refresh_token',
						'code': ticket
					}
				};

				request.post(options, function(err, response, body) {
					if(err)
						return callback(err, null);

					let token = body.split('token=')[1];
					if(!token)
						return callback(new Error('Login failed #1'), null);
					token = token.split('&')[0];
					if(!token)
						return callback(new Error('Login failed #2'), null);

					self.setToken(token);
					callback(null, token);
				});
			});
		});
	}
}