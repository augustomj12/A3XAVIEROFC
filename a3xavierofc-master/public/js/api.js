// API Service for making requests to the server

const API_URL = '/api';

/**
 * Generic fetch function with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Algo deu errado');
    }
    
    return data;
  } catch (error) {
    console.error(`Erro na API (${endpoint}):`, error);
    throw error;
  }
}

// Receptionist API
const ReceptionistAPI = {
  // Get all tables
  getTables: () => fetchAPI('/reservations/tables'),
  
  // Get all reservations
  getReservations: () => fetchAPI('/reservations'),
  
  // Create a new reservation
  createReservation: (reservation) => fetchAPI('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservation),
  }),
  
  // Cancel a reservation
  cancelReservation: (id) => fetchAPI(`/reservations/${id}`, {
    method: 'DELETE',
  }),
};

// Waiter API
const WaiterAPI = {
  // Get all waiters
  getWaiters: () => fetchAPI('/reservations/waiters'),
  
  // Get all reservations (for waiter to see which ones need to be fulfilled)
  getReservations: () => fetchAPI('/reservations'),
  
  // Mark a reservation as fulfilled
  fulfillReservation: (id, waiterId) => fetchAPI(`/reservations/${id}/fulfill`, {
    method: 'PUT',
    body: JSON.stringify({ waiter_id: waiterId }),
  }),
};

// Manager API
const ManagerAPI = {
  // Get reservation report by status and date range
  getReservationReport: (status, startDate, endDate) => {
    const params = new URLSearchParams({
      status: status || '',
      start_date: startDate,
      end_date: endDate,
    });
    
    return fetchAPI(`/reports/reservations?${params}`);
  },
  
  // Get reservations by table number
  getReservationsByTable: (tableNumber) => fetchAPI(`/reports/tables/${tableNumber}`),
  
  // Get tables confirmed by waiter
  getTablesByWaiter: (waiterId) => fetchAPI(`/reports/waiters/${waiterId}`),
  
  // Get all waiters (for dropdown selection)
  getWaiters: () => fetchAPI('/reservations/waiters'),
  
  // Get all tables (for dropdown selection)
  getTables: () => fetchAPI('/reservations/tables'),
};

// Export all APIs
export { ReceptionistAPI, WaiterAPI, ManagerAPI };