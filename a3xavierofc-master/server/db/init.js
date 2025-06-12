import openDb from './database.js';

async function initDb() {
  try {
    const db = await openDb();
    
    // Create tables table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL UNIQUE,
        capacity INTEGER NOT NULL
      )
    `);

    // Create reservations table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        table_number INTEGER NOT NULL,
        party_size INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        status TEXT DEFAULT 'reserved' CHECK(status IN ('reserved', 'fulfilled', 'cancelled')),
        fulfilled_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create waiters table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS waiters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Insert sample data
    
    // Add sample tables (1-10)
    for (let i = 1; i <= 10; i++) {
      const capacity = i <= 5 ? 4 : (i <= 8 ? 6 : 8); // Tables 1-5: 4 seats, 6-8: 6 seats, 9-10: 8 seats
      await db.run('INSERT OR IGNORE INTO tables (number, capacity) VALUES (?, ?)', [i, capacity]);
    }

    // Add sample waiters
    const sampleWaiters = ['Alana Rosa', 'Gustavo Martin', 'Leandro Lima'];
    for (const waiter of sampleWaiters) {
      await db.run('INSERT OR IGNORE INTO waiters (name) VALUES (?)', [waiter]);
    }

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

// Run the initialization
initDb();