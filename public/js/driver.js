const API_URL = 'http://localhost:3000/api';

// Auto-refresh interval (5 seconds)
const REFRESH_INTERVAL = 5000;

document.addEventListener('DOMContentLoaded', () => {
    fetchRoute();
    setupWasteForm();

    // Real-time polling
    setInterval(fetchRoute, REFRESH_INTERVAL);
    console.log('Real-time updates enabled (every 5 seconds)');
});

function fetchRoute() {
    fetch(`${API_URL}/bins`)
        .then(res => res.json())
        .then(bins => {
            renderRoute(bins);
            updateStats(bins);
        })
        .catch(err => {
            console.error('Error fetching route:', err);
        });
}

function updateStats(bins) {
    const collected = bins.filter(b => b.status === 'Collected').length;
    const pending = bins.filter(b => b.status === 'Pending').length;
    const overflow = bins.filter(b => b.level === 'Overflowing').length;

    document.getElementById('collected-count').textContent = collected;
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('overflow-count').textContent = overflow;

    const statusEl = document.getElementById('route-status');
    if (pending === 0 && bins.length > 0) {
        statusEl.textContent = 'Complete';
        statusEl.className = 'status-badge status-collected';
    } else {
        statusEl.textContent = 'In Progress';
        statusEl.className = 'status-badge status-pending';
    }
}

function renderRoute(bins) {
    const list = document.getElementById('route-list');

    if (bins.length === 0) {
        list.innerHTML = `
            <div class="list-item" style="justify-content: center; padding: 40px;">
                <p style="color: var(--text-secondary);">No bins assigned for today.</p>
            </div>
        `;
        return;
    }

    // Only re-render if data has changed
    const currentHTML = list.innerHTML;
    let newHTML = '';

    bins.forEach((bin, index) => {
        const isCollected = bin.status === 'Collected';
        const isOverflow = bin.level === 'Overflowing';

        newHTML += `
            <div class="list-item">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: ${isCollected ? 'rgba(0, 77, 64, 0.5)' : 'rgba(59, 130, 246, 0.15)'}; display: flex; align-items: center; justify-content: center; color: ${isCollected ? '#ccff00' : 'var(--info)'}; font-weight: 600;">
                        ${isCollected ? '✓' : index + 1}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${bin.location}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            ${bin.zone} Zone
                            ${isOverflow ? '<span style="color: var(--danger); font-weight: 600;"> • Overflowing!</span>' : ''}
                        </div>
                    </div>
                </div>
                <div>
                    ${isCollected
                ? '<span class="status-badge status-collected"><ion-icon name="checkmark-outline"></ion-icon> Done</span>'
                : `<button onclick="collectBin(${bin.id})" class="btn" style="padding: 8px 16px; font-size: 0.85rem;">
                            <ion-icon name="checkmark-circle-outline"></ion-icon> Collect
                        </button>`
            }
                </div>
            </div>
        `;
    });

    list.innerHTML = newHTML;
}

window.collectBin = function (id) {
    const btn = event.target.closest('button');
    btn.disabled = true;
    btn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> ...';

    fetch(`${API_URL}/bins/${id}/collect`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Data will auto-refresh
            } else {
                alert('Error updating status');
            }
        })
        .catch(err => console.error(err));
};

function setupWasteForm() {
    document.getElementById('waste-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('waste-type').value;
        const weight = document.getElementById('waste-weight').value;

        if (!weight || parseFloat(weight) <= 0) {
            alert('Please enter a valid weight');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Logging...';

        fetch(`${API_URL}/waste`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, weight: parseFloat(weight) })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('✅ Waste logged! Admin dashboard will update automatically.');
                    document.getElementById('waste-form').reset();
                } else {
                    alert('Error logging waste');
                }
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="add-circle-outline"></ion-icon> Log Entry';
            })
            .catch(err => {
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="add-circle-outline"></ion-icon> Log Entry';
            });
    });
}
