import openDb from '../db/database.js';

class Table {
  // Get all tables
  static async getAll() {
    const db = await openDb();
    
    try {
      const tables = await db.all('SELECT * FROM tables ORDER BY number');
      return { success: true, data: tables };
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      return { success: false, message: 'Falha ao buscar mesas.' };
    }
  }

  // Get table by number
  static async getByNumber(number) {
    const db = await openDb();
    
    try {
      const table = await db.get('SELECT * FROM tables WHERE number = ?', [number]);
      
      if (!table) {
        return { success: false, message: 'Mesa não encontrada.' };
      }
      
      return { success: true, data: table };
    } catch (error) {
      console.error('Erro ao buscar mesa:', error);
      return { success: false, message: 'Falha ao buscar mesa.' };
    }
  }
}

export default Table;