export const AvgSchema = {
  name: 'AvgCalculator',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    type: 'string', // 'normal' ou 'ponderada'
    grades: 'float[]',
    weights: 'float[]', // só usado para ponderada
  },
};
