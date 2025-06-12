import express from 'express';
import Reservation from '../models/reservation.js';
import Table from '../models/table.js';
import Waiter from '../models/waiter.js';

const router = express.Router();

// Get all tables (for dropdown selection)
router.get('/tables', async (req, res) => {
  const result = await Table.getAll();
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});

// Get all waiters (for dropdown selection)
router.get('/waiters', async (req, res) => {
  const result = await Waiter.getAll();
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});

// Get all reservations
router.get('/', async (req, res) => {
  const result = await Reservation.getAll();
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
});

// Get a specific reservation
router.get('/:id', async (req, res) => {
  const result = await Reservation.getById(req.params.id);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(404).json({ error: result.message });
  }
});

// Create a new reservation
router.post('/', async (req, res) => {
  const { date, time, table_number, party_size, customer_name } = req.body;

  // Validate required fields
  if (!date || !time || !table_number || !party_size || !customer_name) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Validate party size
  if (party_size < 1 || party_size > 8) {
    return res.status(400).json({ error: 'O número de pessoas deve estar entre 1 e 8.' });
  }

  // Validate time format
  const allowedTimes = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  if (!allowedTimes.includes(time)) {
    return res.status(400).json({ error: 'Horário inválido. Selecione um horário entre 12h e 22h.' });
  }

  // Validate customer name
  if (!customer_name.trim() || customer_name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome do responsável deve ter pelo menos 2 caracteres.' });
  }

  // Validate date is not in the past
  const reservationDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (reservationDate < today) {
    return res.status(400).json({ error: 'Não é possível fazer reservas para datas passadas.' });
  }

  // Create reservation
  const result = await Reservation.create({
    date,
    time,
    table_number: parseInt(table_number, 10),
    party_size: parseInt(party_size, 10),
    customer_name: customer_name.trim()
  });

  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ error: result.message });
  }
});

// Cancel a reservation
router.delete('/:id', async (req, res) => {
  const result = await Reservation.cancel(req.params.id);
  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(400).json({ error: result.message });
  }
});

// Mark a reservation as fulfilled
router.put('/:id/fulfill', async (req, res) => {
  const { waiter_id } = req.body;

  // Validate required fields
  if (!waiter_id) {
    return res.status(400).json({ error: 'ID do garçom é obrigatório.' });
  }

  const result = await Reservation.fulfill(req.params.id, waiter_id);
  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(400).json({ error: result.message });
  }
});

export default router;