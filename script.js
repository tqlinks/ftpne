// CẤU HÌNH HỆ THỐNG
// Thay đổi phần đầu của file script.js như sau:

// Lấy link từ file config.js
const SCRIPT_URL = CONFIG.SCRIPT_URL;


// 1. Hàm lấy dữ liệu thống kê từ Google Sheet (GET)
// Cập nhật hàm fetchDashboardStats để không bị lỗi trên các trang không có dashboard
async function fetchDashboardStats() {
    try {
        const response = await fetch(CONFIG.SCRIPT_URL);
        const data = await response.json();

        // Chỉ cập nhật nếu tìm thấy ID trên trang hiện tại
        const elTotal = document.getElementById('stat-total');
        if (elTotal) elTotal.innerText = data.total || 0;
        
        const elAion = document.getElementById('stat-aion2');
        if (elAion) elAion.innerText = data.aion2 || 0;

        const elMaple = document.getElementById('stat-maple');
        if (elMaple) elMaple.innerText = data.maple || 0;

        const elTeams = document.getElementById('stat-teams');
        if (elTeams) elTeams.innerText = data.teams || "0/0/0";
        
    } catch (error) {
        // Không báo lỗi ra màn hình nếu không có phần tử
        console.warn("Trang này không có Dashboard để cập nhật.");
    }
}

// 2. Xử lý gửi Form Đăng ký (POST)
// Trong file script.js, thay đổi phần xử lý gửi form như sau:
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

        // CHỈNH SỬA QUAN TRỌNG TẠI ĐÂY
        fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Ép buộc không kiểm tra CORS
            headers: {
                'Content-Type': 'text/plain' // Đánh lừa trình duyệt
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            // Với mode 'no-cors', chúng ta không đọc được phản hồi thành công từ Google
            // Nhưng 99% dữ liệu ĐÃ VÀO được Sheet nếu cấu hình Apps Script đúng.
            alert("Thông tin đã được gửi đi thành công!");
            this.reset();
            if (typeof fetchDashboardStats === 'function') fetchDashboardStats();
        })
        .catch(err => {
            console.error("Lỗi mạng:", err);
            alert("Có lỗi kết nối, vui lòng thử lại.");
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        });
    });
}


// 3. Tiện ích: Ẩn/Hiện mật khẩu
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

// Khởi chạy khi tải trang
window.onload = () => {
    fetchDashboardStats();
    setInterval(fetchDashboardStats, 60000); // Tự động cập nhật mỗi 1 phút
};
// XỬ LÝ ĐĂNG NHẬP
// Đảm bảo không có dấu chấm lẻ loi ở đầu hoặc cuối file
async function handleLogin() {
    const idEl = document.getElementById('login-id');
    const passEl = document.getElementById('login-pass');
    
    if (!idEl || !passEl) return;

    const id = idEl.value;
    const pass = passEl.value;
    const btn = document.getElementById('loginBtn');

    if (!id || !pass) {
        alert("Vui lòng nhập ID và Mật khẩu");
        return;
    }
    
    btn.disabled = true;
    btn.innerText = "Đang kiểm tra...";

    try {
        // Dùng URLSearchParams để tránh lỗi ghép chuỗi sai
        const params = new URLSearchParams({
            action: "login",
            id: id,
            pass: pass
        });
        
        const res = await fetch(`${CONFIG.SCRIPT_URL}?${params.toString()}`);
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'profile.html';
        } else {
            alert(data.message || "Sai ID hoặc mật khẩu");
        }
    } catch (e) {
        console.error("Lỗi:", e);
        alert("Không thể kết nối máy chủ!");
    } finally {
        btn.disabled = false;
        btn.innerText = "ĐĂNG NHẬP";
    }
}
async function fetchDashboardStats() {
    try {
        const res = await fetch(CONFIG.SCRIPT_URL);
        const data = await res.json();
        
        const update = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        update('stat-total', data.total || 0);
        update('stat-aion2', data.aion2 || 0);
        update('stat-maple', data.maple || 0);
        update('stat-teams', data.teams || "0/0/0");
    } catch (e) {
        console.warn("Dashboard không có trên trang này.");
    }
}

// Tự động chạy stats nếu có thẻ id trên trang
if (document.getElementById('stat-total')) {
    fetchDashboardStats();
}
// XỬ LÝ CẬP NHẬT SẢN LƯỢNG
async function updateProduction() {
    const user = JSON.parse(localStorage.getItem('user'));
    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const btn = document.getElementById('updateBtn');

    btn.disabled = true;
    btn.innerText = "Đang lưu...";

    const payload = {
        action: "update_prod",
        id: user.id,
        kinah: kinah,
        meso: meso
    };

    // Dùng mode 'no-cors' để gửi dữ liệu nhanh
    fetch(CONFIG.SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // Ép buộc bỏ qua kiểm tra CORS
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
})
.then(() => {
    alert("Gửi thông tin thành công!");
    regForm.reset();
    if(document.getElementById('stat-total')) fetchDashboardStats();
});
    finally(() => {
        btn.disabled = false;
        btn.innerText = "LƯU SẢN LƯỢNG MỚI";
    });
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
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
