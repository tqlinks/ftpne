// ==========================================
// 1. CẤU HÌNH & KHỞI TẠO
// ==========================================
const SCRIPT_URL = CONFIG.SCRIPT_URL;

// Khởi chạy khi tải trang
window.onload = () => {
    // Chỉ chạy Dashboard nếu trang có các thẻ hiển thị
    if (document.getElementById('stat-total')) {
        fetchDashboardStats();
        setInterval(fetchDashboardStats, 60000); // Cập nhật mỗi 1 phút
    }
    
    // Nếu đang ở trang profile, tải thông tin user
    if (document.getElementById('p-id')) {
        loadProfile();
    }
};

// ==========================================
// 2. HÀM LẤY THỐNG KÊ DASHBOARD (GET)
// ==========================================
async function fetchDashboardStats() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        };

        updateText('stat-total', data.total || 0);
        updateText('stat-aion2', data.aion2 || 0);
        updateText('stat-maple', data.maple || 0);
        updateText('stat-teams', data.teams || "0/0/0");
        
    } catch (error) {
        console.warn("Dashboard không có trên trang này hoặc lỗi kết nối.");
    }
}

// ==========================================
// 3. XỬ LÝ ĐĂNG NHẬP
// ==========================================
async function handleLogin() {
    const idEl = document.getElementById('login-id');
    const passEl = document.getElementById('login-pass');
    const btn = document.getElementById('loginBtn');

    if (!idEl || !passEl || !btn) return;

    const id = idEl.value;
    const pass = passEl.value;

    if (!id || !pass) {
        alert("Vui lòng nhập ID và Mật khẩu");
        return;
    }
    
    btn.disabled = true;
    btn.innerText = "Đang kiểm tra...";

    try {
        const params = new URLSearchParams({ action: "login", id: id, pass: pass });
        const res = await fetch(`${SCRIPT_URL}?${params.toString()}`);
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'profile.html';
        } else {
            alert(data.message || "Sai ID hoặc mật khẩu");
        }
    } catch (e) {
        console.error("Lỗi đăng nhập:", e);
        alert("Lỗi kết nối máy chủ! Hãy kiểm tra link Apps Script.");
    } finally {
        btn.disabled = false;
        btn.innerText = "ĐĂNG NHẬP";
    }
}

// ==========================================
// 4. XỬ LÝ ĐĂNG KÝ (POST)
// ==========================================
const regForm = document.getElementById('registrationForm');
if (regForm) {
    regForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const originalContent = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

        const formData = new FormData(this);
        const payload = Object.fromEntries(formData.entries());

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        })
        .then(() => {
            alert("Đăng ký thành công! Chờ Admin phê duyệt.");
            this.reset();
        })
        .catch(err => {
            console.error("Lỗi:", err);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        });
    });
}

// ==========================================
// 5. CẬP NHẬT SẢN LƯỢNG (POST)
// ==========================================
async function updateProduction() {
    const user = JSON.parse(localStorage.getItem('user'));
    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const btn = document.getElementById('updateBtn');

    if (!user) return alert("Hết phiên làm việc, vui lòng đăng nhập lại.");

    btn.disabled = true;
    btn.innerText = "Đang lưu...";

    const payload = {
        action: "update_prod",
        id: user.id,
        kinah: kinah,
        meso: meso
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("Cập nhật sản lượng thành công!");
        // Cập nhật lại dữ liệu tạm thời
        user.kinah = kinah;
        user.meso = meso;
        localStorage.setItem('user', JSON.stringify(user));
    })
    .catch(err => alert("Lỗi kết nối!"))
    .finally(() => {
        btn.disabled = false;
        btn.innerText = "LƯU SẢN LƯỢNG MỚI";
    });
}

// ==========================================
// 6. TIỆN ÍCH PROFILE & LOGOUT
// ==========================================
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('p-id').innerText = user.id;
    document.getElementById('p-team').innerText = user.team;
    document.getElementById('p-game').innerText = user.game;
    document.getElementById('input-kinah').value = user.kinah || 0;
    document.getElementById('input-meso').value = user.meso || 0;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

window.togglePassword = function() {
    const passInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eyeIcon');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passInput.type = 'password';
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
};
