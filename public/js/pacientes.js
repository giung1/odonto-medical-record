// ===== Patients Data Management =====
let patients = [];
let patientToDelete = null;

// Initialize with sample data
function initSampleData() {
  const samplePatients = [
    {
      id: generateId(),
      nombre: 'María García López',
      telefono: '+54 9 11 4567-8901',
      email: 'maria.garcia@email.com',
      fechaNacimiento: '1985-03-15',
      direccion: 'Av. Corrientes 1234, CABA',
      notas: 'Alergia a penicilina',
      fechaRegistro: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      nombre: 'Carlos Rodríguez',
      telefono: '+54 9 11 2345-6789',
      email: 'carlos.rodriguez@email.com',
      fechaNacimiento: '1978-07-22',
      direccion: 'Calle Florida 567, CABA',
      notas: '',
      fechaRegistro: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      nombre: 'Ana Martínez',
      telefono: '+54 9 11 9876-5432',
      email: 'ana.martinez@email.com',
      fechaNacimiento: '1992-11-08',
      direccion: 'San Martín 890, Palermo',
      notas: 'Paciente diabética tipo 2',
      fechaRegistro: new Date().toISOString()
    },
    {
      id: generateId(),
      nombre: 'Roberto Fernández',
      telefono: '+54 9 11 5555-1234',
      email: '',
      fechaNacimiento: '1965-02-28',
      direccion: 'Lavalle 456, Recoleta',
      notas: 'Tratamiento de ortodoncia en curso',
      fechaRegistro: new Date().toISOString()
    }
  ];

  // Load from localStorage or use sample data
  const stored = localStorage.getItem('patients');
  if (stored) {
    patients = JSON.parse(stored);
  } else {
    patients = samplePatients;
    localStorage.setItem('patients', JSON.stringify(patients));
  }
}

function generateId() {
  return 'pat_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function savePatients() {
  localStorage.setItem('patients', JSON.stringify(patients));
  updateStats();
  renderPatients();
}

// ===== DOM Elements =====
const patientsTableBody = document.getElementById('patientsTableBody');
const emptyState = document.getElementById('emptyState');
const patientModal = document.getElementById('patientModal');
const deleteModal = document.getElementById('deleteModal');
const patientForm = document.getElementById('patientForm');
const searchInput = document.getElementById('searchInput');
const toastContainer = document.getElementById('toastContainer');

// Stat elements
const totalPatientsEl = document.getElementById('totalPatients');
const activePatientsEl = document.getElementById('activePatients');
const newPatientsEl = document.getElementById('newPatients');

// ===== Render Functions =====
function renderPatients(filter = '') {
  const filteredPatients = patients.filter(p => 
    p.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    p.telefono.includes(filter) ||
    (p.email && p.email.toLowerCase().includes(filter.toLowerCase()))
  );

  if (filteredPatients.length === 0) {
    patientsTableBody.innerHTML = '';
    emptyState.style.display = 'flex';
    document.querySelector('.table-container').style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  document.querySelector('.table-container').style.display = 'block';

  patientsTableBody.innerHTML = filteredPatients.map((patient, index) => `
    <tr style="animation-delay: ${index * 0.05}s">
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="avatar avatar-sm">${getInitials(patient.nombre)}</div>
          <div>
            <div style="font-weight: 500;">${escapeHtml(patient.nombre)}</div>
            ${patient.fechaNacimiento ? `<div style="font-size: 0.75rem; color: var(--muted-foreground);">${formatDate(patient.fechaNacimiento)}</div>` : ''}
          </div>
        </div>
      </td>
      <td>${escapeHtml(patient.telefono)}</td>
      <td>${patient.email ? escapeHtml(patient.email) : '<span style="color: var(--muted-foreground);">—</span>'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="viewPatient('${patient.id}')" title="Ver ficha">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editPatient('${patient.id}')" title="Editar">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="confirmDelete('${patient.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" width="16" height="16" style="stroke: var(--destructive);"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStats() {
  if (totalPatientsEl) {
    totalPatientsEl.textContent = patients.length;
  }
  if (newPatientsEl) {
    const now = new Date();
    const thisMonth = patients.filter(p => {
      const regDate = new Date(p.fechaRegistro);
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length;
    newPatientsEl.textContent = thisMonth;
  }
}

// ===== Modal Functions =====
function openModal(title = 'Agregar Paciente') {
  document.getElementById('modalTitle').textContent = title;
  patientModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  patientModal.classList.remove('active');
  document.body.style.overflow = '';
  patientForm.reset();
  document.getElementById('patientId').value = '';
}

function openDeleteModal() {
  deleteModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  document.body.style.overflow = '';
  patientToDelete = null;
}

// ===== Patient CRUD Operations =====
function addPatient() {
  openModal('Agregar Paciente');
}

function editPatient(id) {
  const patient = patients.find(p => p.id === id);
  if (!patient) return;

  document.getElementById('patientId').value = patient.id;
  document.getElementById('nombre').value = patient.nombre;
  document.getElementById('telefono').value = patient.telefono;
  document.getElementById('email').value = patient.email || '';
  document.getElementById('fechaNacimiento').value = patient.fechaNacimiento || '';
  document.getElementById('direccion').value = patient.direccion || '';
  document.getElementById('notas').value = patient.notas || '';

  openModal('Editar Paciente');
}

function viewPatient(id) {
  // Redirect to patient file (ficha.html)
  window.location.href = `ficha.html?id=${id}`;
}

function confirmDelete(id) {
  const patient = patients.find(p => p.id === id);
  if (!patient) return;

  patientToDelete = id;
  document.getElementById('deletePatientName').textContent = patient.nombre;
  openDeleteModal();
}

function deletePatient() {
  if (!patientToDelete) return;

  const patientName = patients.find(p => p.id === patientToDelete)?.nombre;
  patients = patients.filter(p => p.id !== patientToDelete);
  savePatients();
  closeDeleteModal();
  showToast(`${patientName} ha sido eliminado`, 'success');
}

function savePatientForm(e) {
  e.preventDefault();

  const id = document.getElementById('patientId').value;
  const patientData = {
    nombre: document.getElementById('nombre').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    email: document.getElementById('email').value.trim(),
    fechaNacimiento: document.getElementById('fechaNacimiento').value,
    direccion: document.getElementById('direccion').value.trim(),
    notas: document.getElementById('notas').value.trim(),
    estado: 'activo'
  };

  if (id) {
    // Update existing patient
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...patientData };
      showToast('Paciente actualizado correctamente', 'success');
    }
  } else {
    // Add new patient
    patients.push({
      id: generateId(),
      ...patientData,
      fechaRegistro: new Date().toISOString()
    });
    showToast('Paciente agregado correctamente', 'success');
  }

  savePatients();
  closeModal();
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" style="stroke: ${type === 'success' ? 'hsl(142 76% 36%)' : 'var(--destructive)'}; fill: none; stroke-width: 2;">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
      }
    </svg>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}



// ===== Utility Functions =====
function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  renderPatients();
  updateStats();

  // Add patient buttons
  document.getElementById('addPatientBtn').addEventListener('click', addPatient);
  document.getElementById('addPatientEmptyBtn').addEventListener('click', addPatient);

  // Modal controls
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', deletePatient);

  // Form submission
  patientForm.addEventListener('submit', savePatientForm);

  // Search
  searchInput.addEventListener('input', (e) => {
    renderPatients(e.target.value);
  });


  // Close modals on overlay click
  patientModal.addEventListener('click', (e) => {
    if (e.target === patientModal) closeModal();
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDeleteModal();
    }
  });
});
