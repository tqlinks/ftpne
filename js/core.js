// --- core.js ---

// 1. Hàm hỗ trợ giao diện
const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

// 2. Quản lý Dark Mode
function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// 3. Tiện ích dùng chung (Tải danh sách Team)
async function loadDynamicTeams() {
    const selects = document.querySelectorAll('select[id$="-team"]'); 
    if (selects.length === 0) return; 
    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_teams`);
        const teams = await res.json();
        selects.forEach(select => {
            const currentValue = select.value; 
            let html = select.id === 'kpi-team' ? '<option value="All">Tất cả nhân viên (All Teams)</option>' : '';
            teams.forEach(t => html += `<option value="${t}">${t}</option>`);
            select.innerHTML = html;
            if (currentValue && (teams.includes(currentValue) || currentValue === 'All')) select.value = currentValue;
        });
    } catch(e) { console.log("Không thể tải danh sách Team tự động", e); }
}

// --- KHỞI CHẠY CORE ---
document.addEventListener('DOMContentLoaded', () => {
    // Nạp theme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    loadDynamicTeams();
});
