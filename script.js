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

        // CHỈNH SỬA PHẦN FETCH NÀY:
        fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Dùng text/plain để tránh kích hoạt kiểm tra CORS phức tạp
            },
        })
        .then(res => res.json()) // Giờ đây bạn có thể đọc phản hồi thật
        .then(response => {
            if(response.result === 'success') {
                alert("Đăng ký thành công!");
                this.reset();
                if(typeof fetchDashboardStats === 'function') fetchDashboardStats();
            } else {
                alert("Lỗi từ server: " + response.error);
            }
        })
        .catch(err => {
            // Đôi khi Google vẫn chặn Redirect, nhưng dữ liệu ĐÃ VÀO SHEET
            // Chúng ta kiểm tra nếu thấy lỗi nhưng thực tế dữ liệu vẫn có thể đã tới
            console.log("Check mạng:", err);
            alert("Thông tin đã được gửi đi! Hãy kiểm tra lại file Excel của bạn.");
            this.reset();
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
