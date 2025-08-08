export const LunchBreakTimeHistorySchema = {
  name: 'LunchBreakTimeHistory',
  create: `
    CREATE TABLE IF NOT EXISTS LunchBreakTimeHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      weekday TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL
    );
  `
};
