export const ModulesSchema = {
    name: 'Modules',
    create: `
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY, -- id fixo, sem autoincrement
      name TEXT NOT NULL,
      usage INTEGER DEFAULT 0,
      screen_title TEXT NOT NULL
    );
  `
};
