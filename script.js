// Các hàm an toàn để hiển thị dữ liệu
const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

// 1. Tải số liệu Dashboard
async function fetchStats() {
    try {
        const res = await fetch(CONFIG.SCRIPT_URL);
        const data = await res.json();
        setText('stat-total', data.total || 0);
        setText('stat-aion2', data.aion2 || 0);
        setText('stat-maple', data.maple || 0);
    } catch (e) {
        console.log("Dashboard chưa sẵn sàng.");
    }
}

// --- XỬ LÝ ĐĂNG NHẬP VÀ ĐIỀU HƯỚNG ---
async function handleLogin() {
    const idEl = document.getElementById('login-id');
    const passEl = document.getElementById('login-pass');
    const btn = document.getElementById('loginBtn');

    if (!idEl || !passEl) return;
    const id = idEl.value.trim();
    const pass = passEl.value.trim();

    if (!id || !pass) return alert("Vui lòng nhập ID và Mật khẩu!");

    btn.disabled = true; btn.innerText = "Đang kiểm tra...";

    try {
        const url = `${CONFIG.SCRIPT_URL}?action=login&id=${encodeURIComponent(id)}&pass=${encodeURIComponent(pass)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // PHÂN LUỒNG: ADMIN VÀO INDEX, USER VÀO PROFILE
            if (data.user.role === 'admin') {
                alert("Xin chào Admin! Đang vào trang quản trị tổng...");
                window.location.assign('index.html');
            } else {
                window.location.assign('profile.html');
            }
        } else {
            alert(data.message);
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        btn.disabled = false; btn.innerText = "ĐĂNG NHẬP";
    }
}

// 3. Cập nhật Sản lượng (Aion 2 / Maple)
async function updateProduction() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return window.location.assign('login.html');

    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const btn = document.getElementById('updateBtn');

    btn.disabled = true;
    btn.innerText = "Đang lưu...";

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Ép gửi dữ liệu nhanh
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "update_prod", id: user.id, kinah: kinah, meso: meso })
        });
        
        // Cập nhật lại số liệu hiển thị nội bộ
        user.kinah = kinah; 
        user.meso = meso;
        localStorage.setItem('user', JSON.stringify(user));
        alert("Cập nhật sản lượng thành công!");
    } catch (e) {
        alert("Lỗi khi gửi dữ liệu lên Google Sheet!");
    } finally {
        btn.disabled = false;
        btn.innerText = "LƯU SẢN LƯỢNG";
    }
}

// --- KIỂM SOÁT BẢO MẬT KHI MỞ TRANG ---
window.onload = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Nếu đang ở trang DASHBOARD TỔNG (index.html)
    if (document.getElementById('stat-total')) {
        // CHẶN: Nếu chưa đăng nhập hoặc không phải Admin thì đuổi về
        if (!user || user.role !== 'admin') {
            alert("Bạn không có quyền xem trang quản trị này!");
            window.location.assign(user ? 'profile.html' : 'login.html');
            return;
        }
        fetchStats(); // Chỉ admin mới được chạy lệnh lấy số liệu tổng
    }
    
    // 2. Nếu đang ở trang CÁ NHÂN (profile.html)
    if (document.getElementById('p-id')) {
        if (!user) return window.location.assign('login.html');
        
        setText('p-id', user.id);
        setText('p-team', user.team);
        setText('p-game', user.game);
        setVal('input-kinah', user.kinah || 0);
        setVal('input-meso', user.meso || 0);

        // THÊM NÚT ĐẶC QUYỀN CHO ADMIN: Nút quay lại Dashboard
        if (user.role === 'admin') {
            const adminBtn = document.createElement('button');
            adminBtn.className = "w-full bg-slate-800 text-white p-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-slate-900";
            adminBtn.innerText = "TRỞ VỀ BẢNG ĐIỀU KHIỂN (ADMIN)";
            adminBtn.onclick = () => window.location.assign('index.html');
            document.getElementById('updateBtn').after(adminBtn);
        }
    }
};

function logout() {
    localStorage.removeItem('user');
    window.location.assign('login.html');
}
