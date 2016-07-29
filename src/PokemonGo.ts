/// <reference path="refs/node.d.ts" />
/// <reference path="refs/gpsoauthnode.d.ts" />
/// <reference path="refs/protobufjs.d.ts" />

import ProviderType from './Auth/ProviderType';
import GoogleProvider from './Auth/GoogleProvider';
import ProtoBuf = require('protobufjs');
import request = require('request');

/* ProtoBuf building */
let builder: ProtoBuf.ProtoBuilder = ProtoBuf.loadProtoFile('../proto/POGOProtos.proto');
let pokemonProto: any = builder.build('POGOProtos');//ProtoBuf.MetaMessage<ProtoBuf.Message>
let Networking = pokemonProto.Networking;
let Requests = Networking.Requests;
let Request = Requests.Request;
let Messages = Requests.Messages;
let RequestType = Requests.RequestType;

export default class PokemonGo {
	private token: string;
	private providerType: ProviderType;

	private latitude: number;
	private longitude: number;
	private altitude: number;

	private pokemonProto: any;
	private cookieJar: request.CookieJar;
	private request: request.RequestAPI<request.Request, request.CoreOptions, request.UrlOptions>;

	public static API_URL = "https://pgorelease.nianticlabs.com/plfe/rpc";

	public constructor() {
		console.log(RequestType.GET_PLAYER);
		console.log(new Messages.EchoMessage().encode());
		console.log(new Request(2).encode());

		this.cookieJar = request.jar();
		this.request = request.defaults({
			jar: this.cookieJar
		});
	}

	public login(username: string, password: string, providerType: ProviderType, callback: (err) => void): void {
		this.providerType = providerType;
		this.setLocation(48.8632515, 2.286364, 62);
		this.getAccessToken(username, password, providerType, function(err, token: string) {
			if (err) {
				callback(err);
			}

			callback(null);
		});
	}

	public getAccessToken(username: string, password: string, providerType: ProviderType, callback: (err, token: string) => void): void {
		if (providerType == ProviderType.GOOGLE) {
			new GoogleProvider().login(username, password, this, function(err, token) {
				callback(err, token);
			});
		} else {
			callback(new Error("Invalid provider"), null);
		}
	}

	public getApiEndpoint(callback: (err, apiEndpoint: string) => void): void {

	}

	public apiRequest(): void {

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
}