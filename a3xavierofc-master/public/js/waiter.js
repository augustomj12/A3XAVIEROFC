import { WaiterAPI } from './api.js';
import { formatDate, formatTime, getStatusBadge, showAlert, toggleButtonLoading } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const reservationsTable = document.getElementById('reservations-table');
  const waiterSelect = document.getElementById('waiter_id');
  
  loadWaiters();
  loadReservations();
  
  async function loadWaiters() {
    try {
      const waiters = await WaiterAPI.getWaiters();
      
      if (waiterSelect) {
        waiterSelect.innerHTML = '<option value="">Escolha seu nome da lista</option>';
        
        waiters.forEach(waiter => {
          const option = document.createElement('option');
          option.value = waiter.id;
          option.textContent = waiter.name;
          waiterSelect.appendChild(option);
        });
      }
    } catch (error) {
      showAlert(`Erro ao carregar lista de garçons: ${error.message}`);
    }
  }
  
  async function loadReservations() {
    try {
      if (!reservationsTable) return;
      
      const reservations = await WaiterAPI.getReservations();
      
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
      
      const filteredReservations = reservations.filter(r => r.status === 'reserved');
      
      if (filteredReservations.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">Nenhuma reserva pendente de confirmação</td>
          </tr>
        `;
        return;
      }
      
      filteredReservations.forEach(reservation => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reservation.customer_name}</td>
          <td>${formatDate(reservation.date)}</td>
          <td>${formatTime(reservation.time)}</td>
          <td>Mesa ${reservation.table_number} (${reservation.party_size} pessoas)</td>
          <td>${getStatusBadge(reservation.status)}</td>
          <td>
            <button class="btn btn-success btn-sm fulfill-btn" data-id="${reservation.id}">
              Confirmar Atendimento
            </button>
          </td>
        `;
        
        tbody.appendChild(tr);
      });
      
      const fulfillButtons = document.querySelectorAll('.fulfill-btn');
      fulfillButtons.forEach(button => {
        button.addEventListener('click', () => handleFulfillReservation(button));
      });
    } catch (error) {
      showAlert(`Erro ao carregar reservas: ${error.message}`);
    }
  }
  
  async function handleFulfillReservation(button) {
    const reservationId = button.dataset.id;
    const waiterId = waiterSelect.value;
    
    if (!waiterId) {
      showAlert('Por favor, selecione seu nome antes de confirmar o atendimento.');
      return;
    }
    
    if (!confirm('Tem certeza que deseja confirmar o atendimento desta reserva?')) {
      return;
    }
    
    toggleButtonLoading(button, true);
    
    try {
      await WaiterAPI.fulfillReservation(reservationId, waiterId);
      
      showAlert('Atendimento da reserva confirmado com sucesso!', 'success');
      loadReservations();
    } catch (error) {
      showAlert(`Erro ao confirmar atendimento: ${error.message}`);
    } finally {
      toggleButtonLoading(button, false);
    }
  }
});