// TodoListSchema.js
export const TaskSchema = {
  name: 'Task',
  embedded: true, // tasks vivem dentro da lista
  properties: {
    text: 'string?',
    checked: 'bool?',
  },
};

export const TodoListSchema = {
  name: 'TodoList',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string?',
    tasks: 'Task[]',
  },
};
