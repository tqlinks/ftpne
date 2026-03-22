// CẤU HÌNH HỆ THỐNG
// Thay đổi phần đầu của file script.js như sau:

// Lấy link từ file config.js
const SCRIPT_URL = CONFIG.SCRIPT_URL;


// 1. Hàm lấy dữ liệu thống kê từ Google Sheet (GET)
async function fetchDashboardStats() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        // Cập nhật dữ liệu vào giao diện
        document.getElementById('stat-total').innerText = data.total || 0;
        document.getElementById('stat-aion2').innerText = data.aion2 || 0;
        document.getElementById('stat-maple').innerText = data.maple || 0;
        document.getElementById('stat-teams').innerText = data.teams || "0 / 0 / 0";
    } catch (error) {
        console.error("Lỗi cập nhật Dashboard:", error);
    }
}

// 2. Xử lý gửi Form Đăng ký (POST)
const regForm = document.getElementById('registrationForm');
if (regForm) {
    regForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('submitBtn');
        const originalContent = btn.innerHTML;
        
        // Trạng thái Loading
        btn.disabled = true;
        btn.classList.add('btn-loading');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

        // Thu thập dữ liệu từ các ô input
        const formData = new FormData(this);
        const payload = Object.fromEntries(formData.entries());

        // Gửi dữ liệu qua Apps Script
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(() => {
            alert("Đăng ký thành công! Dữ liệu đang được lưu vào Sheet.");
            this.reset(); 
            fetchDashboardStats(); // Làm mới con số thống kê
        })
        .catch(err => {
            console.error("Lỗi gửi form:", err);
            alert("Không thể kết nối máy chủ. Vui lòng kiểm tra lại mạng.");
        })
        .finally(() => {
            btn.disabled = false;
            btn.classList.remove('btn-loading');
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
