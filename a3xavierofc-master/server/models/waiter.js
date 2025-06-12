import openDb from '../db/database.js';

class Waiter {
  // Get all waiters
  static async getAll() {
    const db = await openDb();
    
    try {
      const waiters = await db.all('SELECT * FROM waiters ORDER BY name');
      return { success: true, data: waiters };
    } catch (error) {
      console.error('Erro ao buscar garçons:', error);
      return { success: false, message: 'Falha ao buscar garçons.' };
    }
  }

  // Get waiter by ID
  static async getById(id) {
    const db = await openDb();
    
    try {
      const waiter = await db.get('SELECT * FROM waiters WHERE id = ?', [id]);
      
      if (!waiter) {
        return { success: false, message: 'Garçom não encontrado.' };
      }
      
      return { success: true, data: waiter };
    } catch (error) {
      console.error('Erro ao buscar garçom:', error);
      return { success: false, message: 'Falha ao buscar garçom.' };
    }
  }
}

export default Waiter;