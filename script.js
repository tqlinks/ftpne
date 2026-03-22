// 1. LẤY THỐNG KÊ (An toàn, không lỗi Null)
async function fetchDashboardStats() {
    try {
        const response = await fetch(CONFIG.SCRIPT_URL);
        const data = await response.json();
        const update = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };
        update('stat-total', data.total || 0);
        update('stat-aion2', data.aion2 || 0);
        update('stat-maple', data.maple || 0);
        update('stat-teams', data.teams || "0/0/0");
    } catch (e) { console.warn("Trang này không có Dashboard."); }
}

// 2. XỬ LÝ ĐĂNG NHẬP
async function handleLogin() {
    const idEl = document.getElementById('login-id');
    const passEl = document.getElementById('login-pass');
    const btn = document.getElementById('loginBtn');
    if (!idEl || !passEl) return;

    btn.disabled = true;
    btn.innerText = "Đang kiểm tra...";

    try {
        const params = new URLSearchParams({ action: "login", id: idEl.value, pass: passEl.value });
        const res = await fetch(`${CONFIG.SCRIPT_URL}?${params.toString()}`);
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'profile.html';
        } else {
            alert(data.message || "Sai ID hoặc mật khẩu");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        btn.disabled = false;
        btn.innerText = "ĐĂNG NHẬP";
    }
}

// 3. CẬP NHẬT SẢN LƯỢNG
async function updateProduction() {
    const user = JSON.parse(localStorage.getItem('user'));
    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const btn = document.getElementById('updateBtn');

    btn.disabled = true;
    btn.innerText = "Đang lưu...";

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "update_prod", id: user.id, kinah: kinah, meso: meso })
        });
        alert("Đã gửi yêu cầu cập nhật!");
    } catch (e) {
        alert("Lỗi gửi dữ liệu!");
    } finally {
        btn.disabled = false;
        btn.innerText = "LƯU SẢN LƯỢNG MỚI";
    }
}

// Khởi chạy khi tải trang
window.onload = () => {
    if (document.getElementById('stat-total')) fetchDashboardStats();
    if (document.getElementById('p-id')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('p-id').innerText = user.id;
            document.getElementById('p-team').innerText = user.team;
            document.getElementById('input-kinah').value = user.kinah || 0;
            document.getElementById('input-meso').value = user.meso || 0;
        }
    }
};
