import PokemonGo from '../PokemonGo';

abstract class Provider {
	public abstract login(username: string, password: string, self: PokemonGo, callback: (err, token: string) => void): void;
}

export default Provider;