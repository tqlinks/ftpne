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

// 2. Xử lý Đăng nhập
async function handleLogin() {
    const idEl = document.getElementById('login-id');
    const passEl = document.getElementById('login-pass');
    const btn = document.getElementById('loginBtn');

    if (!idEl || !passEl) return;
    const id = idEl.value.trim();
    const pass = passEl.value.trim();

    if (!id || !pass) return alert("Vui lòng nhập ID và Mật khẩu!");

    btn.disabled = true;
    btn.innerText = "Đang kiểm tra...";

    try {
        // encodeURIComponent bảo vệ mật khẩu khỏi lỗi ký tự đặc biệt
        const url = `${CONFIG.SCRIPT_URL}?action=login&id=${encodeURIComponent(id)}&pass=${encodeURIComponent(pass)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.status === "success") {
            // 1. Lưu thông tin người dùng vào bộ nhớ trình duyệt
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // 2. Hiện thông báo (Tùy chọn, bạn có thể xóa dòng alert này đi cho mượt)
            alert("Đăng nhập thành công! Chuyển tới trang cá nhân...");
            
            // 3. LỆNH CHUYỂN HƯỚNG QUAN TRỌNG NHẤT
            window.location.href = 'profile.html'; 
            
        } else {
            alert(data.message);
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ! Hãy kiểm tra lại link trong config.js");
    } finally {
        btn.disabled = false;
        btn.innerText = "ĐĂNG NHẬP";
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

// 4. Khởi chạy khi mở trang
window.onload = () => {
    // Nếu ở trang index
    if (document.getElementById('stat-total')) fetchStats();
    
    // Nếu ở trang profile
    if (document.getElementById('p-id')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setText('p-id', user.id);
            setText('p-team', user.team);
            setText('p-game', user.game);
            setVal('input-kinah', user.kinah || 0);
            setVal('input-meso', user.meso || 0);
        } else {
            window.location.assign('login.html');
        }
    }
};

function logout() {
    localStorage.removeItem('user');
    window.location.assign('login.html');
}
