const API_URL = 'http://localhost:3000/api';
const USER_ID = 1;
const REFRESH_INTERVAL = 3000; // Refresh every 3 seconds

document.addEventListener('DOMContentLoaded', () => {
    fetchPoints();
    setupForms();

    // Auto-refresh points every 3 seconds
    setInterval(fetchPoints, REFRESH_INTERVAL);
});

function fetchPoints() {
    fetch(`${API_URL}/users/${USER_ID}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.green_points !== undefined) {
                const el = document.getElementById('points-display');
                const oldVal = parseInt(el.textContent) || 0;
                const newVal = data.green_points;

                if (oldVal !== newVal) {
                    el.textContent = newVal;
                    el.style.transform = 'scale(1.3)';
                    el.style.color = '#ccff00';
                    setTimeout(() => {
                        el.style.transform = 'scale(1)';
                        el.style.color = '';
                    }, 300);
                }
            }
        })
        .catch(err => console.error('Error:', err));
}

function showToast(message, type = 'success') {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; padding: 16px 24px; background: #111; border: 1px solid ' + (type === 'success' ? '#ccff00' : '#ef4444') + '; border-radius: 12px; display: flex; align-items: center; gap: 12px; z-index: 1000; color: white; backdrop-filter: blur(20px);';
    toast.innerHTML = `
        <ion-icon name="${type === 'success' ? 'checkmark-circle' : 'alert-circle'}" style="color: ${type === 'success' ? '#ccff00' : '#ef4444'}; font-size: 1.25rem;"></ion-icon>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setupForms() {
    document.getElementById('pickup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const subType = document.getElementById('pickup-type').value;
        const desc = document.getElementById('pickup-details').value;

        if (!desc.trim()) {
            showToast('Please describe the items', 'error');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Submitting...';

        fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, type: 'Special Pickup', details: `${subType}: ${desc}` })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Request submitted! +10 Points 🎉', 'success');
                    document.getElementById('pickup-form').reset();
                    fetchPoints(); // Immediate refresh
                }
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="calendar-outline"></ion-icon> Schedule Pickup';
            })
            .catch(() => {
                showToast('Error', 'error');
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="calendar-outline"></ion-icon> Schedule Pickup';
            });
    });

    document.getElementById('report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const location = document.getElementById('report-location').value;

        if (!location.trim()) {
            showToast('Please enter location', 'error');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Submitting...';

        fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, type: 'Overflowing Bin', details: `Location: ${location}` })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Reported! +10 Points 🎉', 'success');
                    document.getElementById('report-form').reset();
                    fetchPoints();
                }
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="alert-circle-outline"></ion-icon> Report Issue';
            })
            .catch(() => {
                showToast('Error', 'error');
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="alert-circle-outline"></ion-icon> Report Issue';
            });
    });
}
