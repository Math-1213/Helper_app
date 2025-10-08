import HttpWrapper from "../../../core/api/HttpWrapper";

const pokemonApi = new HttpWrapper({
  baseURL: "https://pokeapi.co/api/v2/",
});

const dogApi = new HttpWrapper({
  baseURL: 'https://dog.ceo/api/breeds/image/random'
})

export async function getPokemon(name) {
  return pokemonApi.get(`pokemon/${name}`);
}

export async function getDoguinho() {
  return dogApi.get();
}

