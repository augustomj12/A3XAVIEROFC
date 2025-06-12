/**
 * Format a date string to YYYY-MM-DD format
 */
function formatDateForInput(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .split('/')
    .reverse()
    .join('-');
}

/**
 * Format a date string to a more readable format (e.g., 1 jan 2023)
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Format a time string to a more readable format (e.g., 19:30)
 */
function formatTime(timeString) {
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}h`;
  }
  
  return timeString;
}

/**
 * Get status badge HTML based on reservation status
 */
function getStatusBadge(status) {
  const statusText = {
    reserved: 'Reservada',
    fulfilled: 'Confirmada',
    cancelled: 'Cancelada'
  };

  const statusClasses = {
    reserved: 'badge-reserved',
    fulfilled: 'badge-fulfilled',
    cancelled: 'badge-cancelled',
  };
  
  return `<span class="badge ${statusClasses[status] || ''}">${statusText[status] || status}</span>`;
}

/**
 * Show an alert message
 */
function showAlert(message, type = 'error') {
  const alertContainer = document.querySelector('.alert-container');
  
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} fade-in`;
  alert.textContent = message;
  
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * Toggle loading state of a button
 */
function toggleButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    const loadingSpinner = document.createElement('span');
    loadingSpinner.className = 'loading';
    button.prepend(loadingSpinner);
  } else {
    button.disabled = false;
    const loadingSpinner = button.querySelector('.loading');
    if (loadingSpinner) {
      loadingSpinner.remove();
    }
  }
}

export {
  formatDateForInput,
  formatDate,
  formatTime,
  getStatusBadge,
  showAlert,
  toggleButtonLoading,
};