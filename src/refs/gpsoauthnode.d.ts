declare class GoogleOauth {
	public login(email: string, password: string, android_id: string, callback: (err, data: { androidId: string, masterToken: string }) => void): void;
	public oauth(email: string, master_token: string, android_id: string, service: string, app: string, client_sig: string, callback: (err, token: { Auth: string }) => void): void;
}

declare module "gpsoauthnode" {
    export = GoogleOauth;
}