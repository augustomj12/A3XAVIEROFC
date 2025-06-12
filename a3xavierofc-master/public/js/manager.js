import { ManagerAPI } from './api.js';
import { formatDate, formatTime, getStatusBadge, showAlert, toggleButtonLoading } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const statusReportForm = document.getElementById('status-report-form');
  const tableReportForm = document.getElementById('table-report-form');
  const waiterReportForm = document.getElementById('waiter-report-form');
  const reportResultsContainer = document.getElementById('report-results');
  const tableSelect = document.getElementById('table_number');
  const waiterSelect = document.getElementById('waiter_id');
  
  loadTables();
  loadWaiters();
  
  if (statusReportForm) {
    statusReportForm.addEventListener('submit', handleStatusReport);
  }
  
  if (tableReportForm) {
    tableReportForm.addEventListener('submit', handleTableReport);
  }
  
  if (waiterReportForm) {
    waiterReportForm.addEventListener('submit', handleWaiterReport);
  }
  
  async function loadTables() {
    try {
      const tables = await ManagerAPI.getTables();
      
      if (tableSelect) {
        tableSelect.innerHTML = '<option value="">Selecione uma mesa</option>';
        
        tables.forEach(table => {
          const option = document.createElement('option');
          option.value = table.number;
          option.textContent = `Mesa ${table.number}`;
          tableSelect.appendChild(option);
        });
      }
    } catch (error) {
      showAlert(`Erro ao carregar mesas: ${error.message}`);
    }
  }
  
  async function loadWaiters() {
    try {
      const waiters = await ManagerAPI.getWaiters();
      
      if (waiterSelect) {
        waiterSelect.innerHTML = '<option value="">Selecione um garçom</option>';
        
        waiters.forEach(waiter => {
          const option = document.createElement('option');
          option.value = waiter.id;
          option.textContent = waiter.name;
          waiterSelect.appendChild(option);
        });
      }
    } catch (error) {
      showAlert(`Erro ao carregar garçons: ${error.message}`);
    }
  }
  
  async function handleStatusReport(event) {
    event.preventDefault();
    
    const submitButton = statusReportForm.querySelector('button[type="submit"]');
    toggleButtonLoading(submitButton, true);
    
    try {
      const formData = new FormData(statusReportForm);
      const status = formData.get('status');
      const startDate = formData.get('start_date');
      const endDate = formData.get('end_date');
      
      if (!startDate || !endDate) {
        showAlert('Por favor, selecione as datas inicial e final para o relatório.');
        return;
      }
      
      const reservations = await ManagerAPI.getReservationReport(status, startDate, endDate);
      
      displayReportResults(
        reservations, 
        `Reservas ${status ? `com status "${getStatusText(status)}"` : ''} de ${formatDate(startDate)} até ${formatDate(endDate)}`
      );
    } catch (error) {
      showAlert(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      toggleButtonLoading(submitButton, false);
    }
  }
  
  async function handleTableReport(event) {
    event.preventDefault();
    
    const submitButton = tableReportForm.querySelector('button[type="submit"]');
    toggleButtonLoading(submitButton, true);
    
    try {
      const formData = new FormData(tableReportForm);
      const tableNumber = formData.get('table_number');
      
      if (!tableNumber) {
        showAlert('Por favor, selecione uma mesa para gerar o relatório.');
        return;
      }
      
      const reservations = await ManagerAPI.getReservationsByTable(tableNumber);
      
      displayReportResults(reservations, `Histórico de Reservas - Mesa ${tableNumber}`);
    } catch (error) {
      showAlert(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      toggleButtonLoading(submitButton, false);
    }
  }
  
  async function handleWaiterReport(event) {
    event.preventDefault();
    
    const submitButton = waiterReportForm.querySelector('button[type="submit"]');
    toggleButtonLoading(submitButton, true);
    
    try {
      const formData = new FormData(waiterReportForm);
      const waiterId = formData.get('waiter_id');
      
      if (!waiterId) {
        showAlert('Por favor, selecione um garçom para gerar o relatório.');
        return;
      }
      
      const reservations = await ManagerAPI.getTablesByWaiter(waiterId);
      const waiterName = waiterSelect.options[waiterSelect.selectedIndex].text;
      
      displayReportResults(reservations, `Atendimentos Confirmados por ${waiterName}`);
    } catch (error) {
      showAlert(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      toggleButtonLoading(submitButton, false);
    }
  }
  
  function getStatusText(status) {
    const statusTexts = {
      reserved: 'Reservada',
      fulfilled: 'Confirmada',
      cancelled: 'Cancelada'
    };
    return statusTexts[status] || status;
  }
  
  function displayReportResults(reservations, title) {
    if (!reportResultsContainer) return;
    
    reportResultsContainer.innerHTML = '';
    
    const reportCard = document.createElement('div');
    reportCard.className = 'card fade-in';
    
    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;
    
    reportCard.appendChild(cardTitle);
    
    if (!reservations || reservations.length === 0) {
      const noResults = document.createElement('p');
      noResults.textContent = 'Nenhum resultado encontrado para os critérios selecionados.';
      noResults.className = 'text-center';
      reportCard.appendChild(noResults);
    } else {
      const table = document.createElement('table');
      table.className = 'table table-responsive';
      
      table.innerHTML = `
        <thead>
          <tr>
            <th>Responsável</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Mesa</th>
            <th>Status</th>
            ${reservations[0].waiter_name ? '<th>Garçom</th>' : ''}
          </tr>
        </thead>
        <tbody></tbody>
      `;
      
      const tbody = table.querySelector('tbody');
      
      reservations.forEach(reservation => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reservation.customer_name}</td>
          <td>${formatDate(reservation.date)}</td>
          <td>${formatTime(reservation.time)}</td>
          <td>Mesa ${reservation.table_number}</td>
          <td>${getStatusBadge(reservation.status)}</td>
          ${reservation.waiter_name ? `<td>${reservation.waiter_name}</td>` : ''}
        `;
        
        tbody.appendChild(tr);
      });
      
      reportCard.appendChild(table);
      
      // Adicionar resumo estatístico
      const summary = document.createElement('div');
      summary.className = 'mt-2';
      summary.innerHTML = `
        <p><strong>Total de registros encontrados:</strong> ${reservations.length}</p>
      `;
      reportCard.appendChild(summary);
    }
    
    reportResultsContainer.appendChild(reportCard);
  }
});