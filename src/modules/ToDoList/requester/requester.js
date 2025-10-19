// import HttpWrapper from "../../../core/api/HttpWrapper";
import Core from "../../../core";
const HttpWrapper = Core.api.HttpWrapper

const pokemonApi = new HttpWrapper({
  baseURL: "https://pokeapi.co/api/v2/",
});

export async function getPokemonByName(name) {
  console.log(pokemonApi)
  try {
    const res = await pokemonApi.get(`pokemon/${name.toLowerCase()}`);
    return {
      id: res.data.id,
      name: res.data.name,
      sprite: res.data.sprites.front_default,
      type: res.data.types[0].type.name,
      height: res.data.height,
      weight: res.data.weight,
    };
  } catch (err) {
    return null; // não encontrado
  }
}
