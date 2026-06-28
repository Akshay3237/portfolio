// --- Mock API & State Management ---
const STATE_KEY = 'doctor_premium_state';
const NICHE_KEY = 'current_portfolio_niche';

// Initialize and clear state if switching niches
function initNicheState() {
    const currentNiche = localStorage.getItem(NICHE_KEY);
    if (currentNiche !== 'doctor_premium') {
        // Clear previous state
        localStorage.removeItem(STATE_KEY);
        localStorage.setItem(NICHE_KEY, 'doctor_premium');
        
        // Setup initial default mock data
        const initialState = {
            appointments: [],
            messages: [],
            stats: {
                totalPatients: 1250,
                upcomingAppointments: 0,
                satisfactionRate: '99%'
            }
        };
        localStorage.setItem(STATE_KEY, JSON.stringify(initialState));
    }
}

// Get the current state
function getState() {
    return JSON.parse(localStorage.getItem(STATE_KEY)) || {};
}

// Save the state
function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// --- Mock API Functions ---
const api = {
    bookAppointment: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const state = getState();
                const newAppointment = {
                    id: 'APT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    ...data,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                };
                state.appointments.push(newAppointment);
                state.stats.upcomingAppointments += 1;
                saveState(state);
                resolve({ success: true, appointment: newAppointment });
            }, 800); // simulate network delay
        });
    },

    getAppointments: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const state = getState();
                resolve(state.appointments);
            }, 500);
        });
    },
    
    updateAppointmentStatus: (id, status) => {
         return new Promise((resolve) => {
            setTimeout(() => {
                const state = getState();
                const apt = state.appointments.find(a => a.id === id);
                if (apt) {
                    apt.status = status;
                    saveState(state);
                }
                resolve({ success: true });
            }, 300);
        });
    },

    submitContact: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const state = getState();
                state.messages.push({
                    id: 'MSG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    ...data,
                    date: new Date().toISOString()
                });
                saveState(state);
                resolve({ success: true });
            }, 800);
        });
    },

    getStats: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const state = getState();
                resolve(state.stats);
            }, 300);
        });
    }
};

// --- UI Logic ---
document.addEventListener('DOMContentLoaded', () => {
    initNicheState();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '80px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'white';
            navLinks.style.padding = '2rem';
            navLinks.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        });
    }

    // Initialize specific page logic based on elements present
    initAppointmentForm();
    initAdminDashboard();
    initContactForm();
});

function initAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Booking...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const res = await api.bookAppointment(data);
        
        if (res.success) {
            form.innerHTML = `
                <div class="success-message text-center" style="padding: 3rem;">
                    <i class="fas fa-check-circle text-primary" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h3>Appointment Booked!</h3>
                    <p>Your appointment ID is <strong>${res.appointment.id}</strong>. We will contact you shortly to confirm.</p>
                    <button class="btn btn-primary mt-4" onclick="location.reload()">Book Another</button>
                </div>
            `;
        }
    });
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const res = await api.submitContact(data);
        
        if (res.success) {
            alert('Message sent successfully! We will get back to you soon.');
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

async function initAdminDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    if (!dashboard) return;

    // Load Stats
    const stats = await api.getStats();
    document.getElementById('statTotalPatients').textContent = stats.totalPatients;
    document.getElementById('statUpcoming').textContent = stats.upcomingAppointments;
    document.getElementById('statSatisfaction').textContent = stats.satisfactionRate;

    // Load Appointments
    await loadAdminAppointments();
}

async function loadAdminAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;

    const appointments = await api.getAppointments();
    
    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No appointments found.</td></tr>';
        return;
    }

    tableBody.innerHTML = appointments.map(apt => `
        <tr>
            <td>${apt.id}</td>
            <td>${apt.patientName}</td>
            <td>${apt.date} ${apt.timeSlot}</td>
            <td>${apt.department}</td>
            <td>
                <span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span>
            </td>
            <td>
                ${apt.status === 'Pending' ? `
                    <button class="btn btn-sm btn-outline" onclick="updateAptStatus('${apt.id}', 'Confirmed')">Confirm</button>
                    <button class="btn btn-sm btn-outline" style="color:red; border-color:red" onclick="updateAptStatus('${apt.id}', 'Cancelled')">Cancel</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

window.updateAptStatus = async function(id, status) {
    await api.updateAppointmentStatus(id, status);
    loadAdminAppointments(); // reload table
};
