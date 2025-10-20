export const SubjectSchema = {
  name: 'Subject',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string?',
    type: 'string?', // 'Normal' | 'Ponderada'
    grades: 'Grade[]',
  },
};

export const GradeSchema = {
  name: 'Grade',
  embedded: true,
  properties: {
    name: 'string?',
    value: 'double?',
    weight: 'double?', // Só usado em Ponderado
  },
};
