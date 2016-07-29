/// <reference path="refs/node.d.ts" />
/// <reference path="refs/gpsoauthnode.d.ts" />
/// <reference path="refs/protobufjs.d.ts" />

import ProviderType from './Auth/ProviderType';
import GoogleProvider from './Auth/GoogleProvider';
import ProtoBuf = require('protobufjs');
import request = require('request');

/* ProtoBuf building */
let builder: ProtoBuf.ProtoBuilder = ProtoBuf.loadProtoFile('../proto/POGOProtos.proto');
let pokemonProto: any = builder.build('POGOProtos');
let Networking = pokemonProto.Networking;
let Requests = Networking.Requests;
let Envelopes = Networking.Envelopes;
let Request = Requests.Request;
let Messages = Requests.Messages;
let RequestType = Requests.RequestType;
let RequestEnvelope = Envelopes.RequestEnvelope;
let ResponseEnvelope = Envelopes.ResponseEnvelope;

export default class PokemonGo {
	private token: string;
	private apiEndpoint: string;
	private providerType: ProviderType;

	private latitude: number;
	private longitude: number;
	private altitude: number;

	private pokemonProto: any;
	private cookieJar: request.CookieJar;
	private request: request.RequestAPI<request.Request, request.CoreOptions, request.UrlOptions>;

	public static API_URL = "https://pgorelease.nianticlabs.com/plfe/rpc";

	public constructor() {
		//console.log(RequestType.GET_PLAYER);
		//console.log(new Messages.EchoMessage().encode());
		//console.log(new Request(2).encode());
		//console.log(new Request().encode());
		//console.log(new Request(RequestType.GET_PLAYER).encode());

		this.cookieJar = request.jar();
		this.request = request.defaults({
			jar: this.cookieJar
		});
	}

	public login(username: string, password: string, providerType: ProviderType, callback: (err) => void): void {
		this.providerType = providerType;
		this.setLocation(48.8632515, 2.286364, 62);
		let self: PokemonGo = this;
		this.requestAccessToken(username, password, providerType, function(err, token: string) {
			if (err) {
				return callback(err);
			}

			self.requestApiEndpoint(function (err, apiEndpoint) {
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	}

	public requestAccessToken(username: string, password: string, providerType: ProviderType, callback: (err, token: string) => void): void {
		if (providerType == ProviderType.GOOGLE) {
			new GoogleProvider().login(username, password, this, function(err, token) {
				callback(err, token);
			});
		} else {
			callback(new Error("Invalid provider"), null);
		}
	}

	public requestApiEndpoint(callback: (err, apiEndpoint) => void): void {
		let req = [new Request(RequestType.GET_PLAYER), new Request(RequestType.GET_HATCHED_EGGS), new Request(RequestType.GET_INVENTORY), new Request(RequestType.CHECK_AWARDED_BADGES), new Request(RequestType.DOWNLOAD_SETTINGS)];
		let self: PokemonGo = this;
		this.apiRequest(PokemonGo.API_URL, this.token, req, function(err, ret) {
			if(err){
				return callback(err, null);
			}

			let apiEndpoint = "https://" + ret.api_url + "/rpc";
			self.setApiEndpoint(apiEndpoint);
			callback(null, self.getApiEndpoint());
		});
	}

	public apiRequest(apiEndpoint: string, accessToken: string, req: any, callback: (err, ret) => void): void {
		let authInfo = new RequestEnvelope.AuthInfo({
			provider: this.providerType == ProviderType.GOOGLE ? "google" : "ptc",
			token: new RequestEnvelope.AuthInfo.JWT(accessToken, 59)
		});

		let f_req = new RequestEnvelope({
			status_code: 2,
			request_id: 1469378659230941192,
			requests: req,

			latitude: this.getLatitude(),
			longitude: this.getLongitude(),
			altitude: this.getAltitude(),

			auth_info: authInfo,
			unknown12: 989
		});

		let buffer = f_req.encode().toBuffer();

		let options = {
			url: apiEndpoint,
			body: buffer,
			encoding: null,
			headers: {
				'User-Agent': 'Niantic App'
			}
		}

		let self: PokemonGo = this;
		this.request.post(options, function(err, response, body) {
			if (err) {
				return callback(new Error('Error'), null);
			}

			if (response === undefined || body === undefined) {
				return callback(new Error('RPC Server offline'), null);
			}

			let ret;
			try {
				ret = ResponseEnvelope.decode(body);
			} catch (e) {
				if (e.decoded) {
					ret = e.decoded;
				}
			}

			if (ret) {
				callback(null, ret);
			} else {
				self.apiRequest(apiEndpoint, accessToken, req, callback);
			}
		});
	}

	public setToken(token: string): void {
		this.token = token;
	}

	public setLatitude(latitude: number): void {
		this.latitude = latitude;
	}

	public setLongitude(longitude: number): void {
		this.longitude = longitude;
	}

	public setAltitude(altitude: number): void {
		this.altitude = altitude;
	}

	public setLocation(latitude: number, longitude: number, altitude: number): void {
		this.setLatitude(latitude);
		this.setLongitude(longitude);
		this.setAltitude(altitude);
	}

	public setApiEndpoint(apiEndpoint: string): void {
		this.apiEndpoint = apiEndpoint;
	}

	public getLatitude(): number {
		return this.latitude;
	}

	public getLongitude(): number {
		return this.longitude;
	}

	public getAltitude(): number {
		return this.altitude;
	}

	public getLocation(): { latitude: number, longitude: number, altitude: number } {
		return { latitude: this.latitude, longitude: this.longitude, altitude: this.altitude };
	}

	public getApiEndpoint(): string {
		return this.apiEndpoint;
	}
}