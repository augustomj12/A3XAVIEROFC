import { ReceptionistAPI } from './api.js';
import { formatDate, formatTime, getStatusBadge, showAlert, toggleButtonLoading } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const reservationForm = document.getElementById('reservation-form');
  const reservationsTable = document.getElementById('reservations-table');
  const tableSelect = document.getElementById('table_number');
  const partySizeInput = document.getElementById('party_size');
  const dateInput = document.getElementById('date');
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  
  loadTables();
  loadReservations();
  
  // Update available tables when party size changes
  if (partySizeInput) {
    partySizeInput.addEventListener('change', loadTables);
  }
  
  if (reservationForm) {
    reservationForm.addEventListener('submit', handleCreateReservation);
  }
  
  async function loadTables() {
    try {
      const tables = await ReceptionistAPI.getTables();
      const partySize = parseInt(partySizeInput?.value || '1', 10);
      
      if (tableSelect) {
        tableSelect.innerHTML = '<option value="">Selecione uma mesa disponível</option>';
        
        // Filter tables by capacity
        const availableTables = tables.filter(table => table.capacity >= partySize);
        
        if (availableTables.length === 0 && partySize > 1) {
          tableSelect.innerHTML = '<option value="">Nenhuma mesa disponível para este número de pessoas</option>';
          return;
        }
        
        availableTables.forEach(table => {
          const option = document.createElement('option');
          option.value = table.number;
          option.textContent = `Mesa ${table.number} (${table.capacity} lugares)`;
          tableSelect.appendChild(option);
        });
      }
    } catch (error) {
      showAlert(`Erro ao carregar mesas: ${error.message}`);
    }
  }
  
  async function loadReservations() {
    try {
      if (!reservationsTable) return;
      
      const reservations = await ReceptionistAPI.getReservations();
      
      const tbody = reservationsTable.querySelector('tbody');
      tbody.innerHTML = '';
      
      if (reservations.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">Nenhuma reserva encontrada</td>
          </tr>
        `;
        return;
      }
      
      reservations.forEach(reservation => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reservation.customer_name}</td>
          <td>${formatDate(reservation.date)}</td>
          <td>${formatTime(reservation.time)}</td>
          <td>Mesa ${reservation.table_number} (${reservation.party_size} pessoas)</td>
          <td>${getStatusBadge(reservation.status)}</td>
          <td>
            ${reservation.status === 'reserved' ? 
              `<button class="btn btn-secondary btn-sm cancel-btn" data-id="${reservation.id}">Cancelar</button>` : 
              ''}
          </td>
        `;
        
        tbody.appendChild(tr);
      });
      
      const cancelButtons = document.querySelectorAll('.cancel-btn');
      cancelButtons.forEach(button => {
        button.addEventListener('click', () => handleCancelReservation(button.dataset.id));
      });
    } catch (error) {
      showAlert(`Erro ao carregar reservas: ${error.message}`);
    }
  }
  
  async function handleCreateReservation(event) {
    event.preventDefault();
    
    const submitButton = reservationForm.querySelector('button[type="submit"]');
    toggleButtonLoading(submitButton, true);
    
    try {
      const formData = new FormData(reservationForm);
      const reservation = {
        date: formData.get('date'),
        time: formData.get('time'),
        table_number: parseInt(formData.get('table_number'), 10),
        party_size: parseInt(formData.get('party_size'), 10),
        customer_name: formData.get('customer_name'),
      };
      
      // Validações do frontend
      if (!reservation.customer_name.trim()) {
        showAlert('Por favor, digite o nome do responsável pela reserva.');
        return;
      }
      
      if (reservation.party_size < 1 || reservation.party_size > 8) {
        showAlert('O número de pessoas deve estar entre 1 e 8.');
        return;
      }
      
      if (!reservation.date) {
        showAlert('Por favor, selecione a data da reserva.');
        return;
      }
      
      // Validate date is not in the past
      const selectedDate = new Date(reservation.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        showAlert('Não é possível fazer reservas para datas passadas.');
        return;
      }
      
      if (!reservation.time) {
        showAlert('Por favor, selecione o horário da reserva.');
        return;
      }
      
      if (!reservation.table_number) {
        showAlert('Por favor, selecione uma mesa disponível.');
        return;
      }
      
      await ReceptionistAPI.createReservation(reservation);
      
      showAlert('Reserva criada com sucesso!', 'success');
      reservationForm.reset();
      dateInput.min = today; // Reset minimum date
      loadReservations();
      loadTables(); // Reload tables to reset the dropdown
    } catch (error) {
      showAlert(`Erro ao criar reserva: ${error.message}`);
    } finally {
      toggleButtonLoading(submitButton, false);
    }
  }
  
  async function handleCancelReservation(id) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }
    
    try {
      await ReceptionistAPI.cancelReservation(id);
      
      showAlert('Reserva cancelada com sucesso!', 'success');
      loadReservations();
    } catch (error) {
      showAlert(`Erro ao cancelar reserva: ${error.message}`);
    }
  }
});