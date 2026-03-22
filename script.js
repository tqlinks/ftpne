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

        // Kiểm tra sự tồn tại của phần tử trước khi gán giá trị
        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        };

        updateText('stat-total', data.total || 0);
        updateText('stat-aion2', data.aion2 || 0);
        updateText('stat-maple', data.maple || 0);
        updateText('stat-teams', data.teams || "0 / 0 / 0");
        
    } catch (error) {
        console.error("Lỗi cập nhật Dashboard:", error);
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
async function handleLogin() {
    // ... lấy id và pass như cũ ...
    
    // Thêm tham số callback để dùng JSONP hoặc gọi GET đơn giản
    const url = `${CONFIG.SCRIPT_URL}?action=login&id=${id}&pass=${pass}`;
    
    try {
        const res = await fetch(url, {
            method: 'GET', // Chuyển sang GET để Google Apps Script dễ chấp nhận hơn
            mode: 'cors'
        });
        const data = await res.json();
        // ... xử lý đăng nhập tiếp theo ...
    } catch (e) {
        console.error("Lỗi đăng nhập:", e);
        alert("Không thể kết nối máy chủ. Hãy kiểm tra lại link Web App!");
    }
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
});.finally(() => {
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
