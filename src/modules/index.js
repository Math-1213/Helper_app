import * as TodoModule from './ToDoList';
import * as AvgCalcModule from './AvgCalculator';
import * as PokemonModule from './PokemonApi';

// Junta todos os módulos num array
export const modules = [
  TodoModule.default,
  AvgCalcModule.default,
  PokemonModule.default,
];

export const screens = modules.reduce((acc, m) => {
  return { ...acc, ...m.screens };
}, {});
