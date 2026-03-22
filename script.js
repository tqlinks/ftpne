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
                localStorage.setItem('user', JSON.stringify(data.user));
            // Đăng nhập xong, TẤT CẢ đều vào profile để báo cáo
            window.location.assign('profile.html');
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

    // 1. TRANG INDEX (Công khai cho mọi người)
    if (document.getElementById('stat-total')) {
        fetchStats(); // Ai vào cũng xem được số tổng
    }
    
    // 2. TRANG PROFILE
    if (document.getElementById('p-id')) {
        if (!user) return window.location.assign('login.html');
        
        setText('p-id', user.id);
        // THÊM 3 DÒNG NÀY ĐỂ HIỂN THỊ THÔNG TIN MỚI
        setText('p-email', user.email || "Chưa cập nhật");
        setText('p-phone', user.phone || "Chưa cập nhật");
        setText('p-pc', user.pc || "Chưa phân công");
        
        setText('p-team', user.team);
        setText('p-game', user.game);
        setVal('input-kinah', user.kinah || 0);
        setVal('input-meso', user.meso || 0);

        // HIỆN NÚT "VÀO TRANG ADMIN" NẾU LÀ LYUKIKZ
        if (user.role === 'admin') {
            const adminBtn = document.createElement('button');
            adminBtn.className = "w-full bg-slate-900 text-white p-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2";
            adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> VÀO TRANG QUẢN TRỊ (ADMIN)';
            adminBtn.onclick = () => window.location.assign('admin.html');
            document.getElementById('updateBtn').after(adminBtn);
        }
    }

    // 3. TRANG ADMIN (Khóa bảo mật)
    if (document.getElementById('admin-table')) {
        // Đuổi cổ nếu chưa đăng nhập hoặc không phải Admin
        if (!user || user.role !== 'admin') {
            alert("Cảnh báo: Bạn không có quyền truy cập trang này!");
            return window.location.assign('profile.html');
        }
        fetchAdminData();
    }
};

function logout() {
    localStorage.removeItem('user');
    window.location.assign('login.html');
}
// --- XỬ LÝ GỬI FORM ĐĂNG KÝ ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Chặn tải lại trang
        const btn = document.getElementById('regBtn');
        btn.disabled = true; 
        btn.innerText = "Đang xử lý...";

        const payload = {
            action: "register",
            id: document.getElementById('reg-id').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            pc: document.getElementById('reg-pc').value,
            team: document.getElementById('reg-team').value,
            game: document.getElementById('reg-game').value,
            password: document.getElementById('reg-pass').value
        };

        try {
            await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Gửi nền không cần đợi Google phản hồi JSON
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });
            alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
            window.location.assign('login.html');
        } catch (error) {
            alert("Lỗi mạng! Không thể gửi thông tin đăng ký.");
        } finally {
            btn.disabled = false; 
            btn.innerText = "ĐĂNG KÝ TÀI KHOẢN";
        }
    });

}
async function fetchAdminData() {
    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        const list = await res.json();
        const tbody = document.getElementById('admin-table');
        tbody.innerHTML = list.map(u => `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 font-bold">${u.id}</td>
                <td class="p-3">${u.team}</td>
                <td class="p-3 text-purple-600 font-bold">${u.kinah}</td>
                <td class="p-3 text-green-600 font-bold">${u.meso}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.log("Lỗi tải dữ liệu Admin");
    }
}
