import express from 'express';
import Reservation from '../models/reservation.js';
import Waiter from '../models/waiter.js';

const router = express.Router();

// Get reservation report by status and date range
router.get('/reservations', async (req, res) => {
  const { status, start_date, end_date } = req.query;
  
  // Validate parameters
  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Data inicial e data final são obrigatórias.' });
  }
  
  const result = await Reservation.getByStatusAndDateRange(status, start_date, end_date);
  
  if (result.success) {
    if (result.data.length === 0) {
      return res.status(404).json({ message: 'Nenhuma reserva encontrada para os critérios especificados.' });
    }
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});

// Get reservations by table number
router.get('/tables/:tableNumber', async (req, res) => {
  const result = await Reservation.getByTableNumber(req.params.tableNumber);
  
  if (result.success) {
    if (result.data.length === 0) {
      return res.status(404).json({ message: 'Nenhuma reserva encontrada para esta mesa.' });
    }
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});

// Get tables confirmed by waiter
router.get('/waiters/:waiterId', async (req, res) => {
  // First, check if waiter exists
  const waiterResult = await Waiter.getById(req.params.waiterId);
  
  if (!waiterResult.success) {
    return res.status(404).json({ error: waiterResult.message });
  }
  
  const result = await Reservation.getByWaiter(req.params.waiterId);
  
  if (result.success) {
    if (result.data.length === 0) {
      return res.status(404).json({ 
        message: `Nenhuma mesa confirmada pelo garçom ${waiterResult.data.name}.` 
      });
    }
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});

export default router;