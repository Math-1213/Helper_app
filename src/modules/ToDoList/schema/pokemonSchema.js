export const PokemonSchema = {
  name: 'Pokemon',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string',
    sprite: 'string?',
    type: 'string?',
    height: 'int?',
    weight: 'int?',
  },
};
