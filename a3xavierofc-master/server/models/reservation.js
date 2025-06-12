import openDb from '../db/database.js';

class Reservation {
  // Create a new reservation
  static async create(reservation) {
    const db = await openDb();
    
    try {
      // Check if table is already reserved at the given date and time
      const existingReservation = await db.get(
        `SELECT * FROM reservations 
         WHERE table_number = ? AND date = ? AND time = ? AND status = 'reserved'`,
        [reservation.table_number, reservation.date, reservation.time]
      );

      if (existingReservation) {
        return { success: false, message: 'Esta mesa já está reservada no horário especificado.' };
      }

      // Check if table exists and has enough capacity
      const table = await db.get(
        'SELECT * FROM tables WHERE number = ?',
        [reservation.table_number]
      );

      if (!table) {
        return { success: false, message: 'Mesa não existe.' };
      }

      if (table.capacity < reservation.party_size) {
        return { 
          success: false, 
          message: `Mesa ${reservation.table_number} tem capacidade apenas para ${table.capacity} pessoas.` 
        };
      }

      // Validate party size
      if (reservation.party_size < 1 || reservation.party_size > 8) {
        return { 
          success: false, 
          message: 'O número de pessoas deve estar entre 1 e 8.' 
        };
      }

      // Validate date is not in the past
      const reservationDate = new Date(reservation.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (reservationDate < today) {
        return { 
          success: false, 
          message: 'Não é possível fazer reservas para datas passadas.' 
        };
      }

      // Validate time format and allowed hours
      const allowedTimes = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
      if (!allowedTimes.includes(reservation.time)) {
        return { 
          success: false, 
          message: 'Horário inválido. Selecione um horário entre 12h e 22h.' 
        };
      }

      // Validate customer name
      if (!reservation.customer_name || reservation.customer_name.trim().length < 2) {
        return { 
          success: false, 
          message: 'Nome do responsável deve ter pelo menos 2 caracteres.' 
        };
      }

      // Insert new reservation
      const result = await db.run(
        `INSERT INTO reservations (date, time, table_number, party_size, customer_name, status)
         VALUES (?, ?, ?, ?, ?, 'reserved')`,
        [
          reservation.date,
          reservation.time,
          reservation.table_number,
          reservation.party_size,
          reservation.customer_name.trim()
        ]
      );

      const newReservation = await db.get('SELECT * FROM reservations WHERE id = ?', [result.lastID]);
      return { success: true, data: newReservation };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      return { success: false, message: 'Falha ao criar reserva.' };
    }
  }

  // Cancel a reservation
  static async cancel(id) {
    const db = await openDb();
    
    try {
      // Check if reservation exists and is not already cancelled or fulfilled
      const reservation = await db.get(
        'SELECT * FROM reservations WHERE id = ?',
        [id]
      );

      if (!reservation) {
        return { success: false, message: 'Reserva não encontrada.' };
      }

      if (reservation.status !== 'reserved') {
        return { 
          success: false, 
          message: `Não é possível cancelar uma reserva que já está ${reservation.status === 'cancelled' ? 'cancelada' : 'confirmada'}.` 
        };
      }

      // Update reservation status to cancelled
      await db.run(
        `UPDATE reservations SET status = 'cancelled' WHERE id = ?`,
        [id]
      );

      return { success: true, message: 'Reserva cancelada com sucesso.' };
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      return { success: false, message: 'Falha ao cancelar reserva.' };
    }
  }

  // Mark a reservation as fulfilled
  static async fulfill(id, waiterId) {
    const db = await openDb();
    
    try {
      // Check if reservation exists and is not already cancelled or fulfilled
      const reservation = await db.get(
        'SELECT * FROM reservations WHERE id = ?',
        [id]
      );

      if (!reservation) {
        return { success: false, message: 'Reserva não encontrada.' };
      }

      if (reservation.status !== 'reserved') {
        return { 
          success: false, 
          message: `Não é possível confirmar uma reserva que já está ${reservation.status === 'cancelled' ? 'cancelada' : 'confirmada'}.` 
        };
      }

      // Check if waiter exists
      const waiter = await db.get('SELECT * FROM waiters WHERE id = ?', [waiterId]);
      if (!waiter) {
        return { success: false, message: 'Garçom não encontrado.' };
      }

      // Update reservation status to fulfilled
      await db.run(
        `UPDATE reservations SET status = 'fulfilled', fulfilled_by = ? WHERE id = ?`,
        [waiterId, id]
      );

      return { success: true, message: 'Reserva confirmada com sucesso.' };
    } catch (error) {
      console.error('Erro ao confirmar reserva:', error);
      return { success: false, message: 'Falha ao confirmar reserva.' };
    }
  }

  // Get all reservations
  static async getAll() {
    const db = await openDb();
    
    try {
      const reservations = await db.all('SELECT * FROM reservations ORDER BY date DESC, time DESC');
      return { success: true, data: reservations };
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return { success: false, message: 'Falha ao buscar reservas.' };
    }
  }

  // Get a specific reservation
  static async getById(id) {
    const db = await openDb();
    
    try {
      const reservation = await db.get('SELECT * FROM reservations WHERE id = ?', [id]);
      
      if (!reservation) {
        return { success: false, message: 'Reserva não encontrada.' };
      }
      
      return { success: true, data: reservation };
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      return { success: false, message: 'Falha ao buscar reserva.' };
    }
  }

  // Get reservations by status and date range
  static async getByStatusAndDateRange(status, startDate, endDate) {
    const db = await openDb();
    
    try {
      let query = 'SELECT * FROM reservations WHERE 1=1';
      const params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY date DESC, time DESC';
      
      const reservations = await db.all(query, params);
      
      return { success: true, data: reservations };
    } catch (error) {
      console.error('Erro ao buscar reservas por status e período:', error);
      return { success: false, message: 'Falha ao buscar reservas.' };
    }
  }

  // Get reservations by table number
  static async getByTableNumber(tableNumber) {
    const db = await openDb();
    
    try {
      const reservations = await db.all(
        'SELECT * FROM reservations WHERE table_number = ? ORDER BY date DESC, time DESC',
        [tableNumber]
      );
      
      return { success: true, data: reservations };
    } catch (error) {
      console.error('Erro ao buscar reservas por mesa:', error);
      return { success: false, message: 'Falha ao buscar reservas.' };
    }
  }

  // Get fulfilled reservations by waiter
  static async getByWaiter(waiterId) {
    const db = await openDb();
    
    try {
      const reservations = await db.all(
        `SELECT r.*, w.name as waiter_name 
         FROM reservations r
         JOIN waiters w ON r.fulfilled_by = w.id
         WHERE r.fulfilled_by = ? AND r.status = 'fulfilled'
         ORDER BY r.date DESC, r.time DESC`,
        [waiterId]
      );
      
      return { success: true, data: reservations };
    } catch (error) {
      console.error('Erro ao buscar reservas por garçom:', error);
      return { success: false, message: 'Falha ao buscar reservas.' };
    }
  }
}

export default Reservation;