document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra nhanh ở LocalStorage để tránh giật trang
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) {
        window.location.assign('login.html');
        return;
    }

    const userId = localUser.uid; // Hoặc id tùy cách bạn lưu

    // 2. Kiểm tra các Element tồn tại trước khi chạy logic tương ứng
    const hasProfileId = document.getElementById('p-id');
    const hasStats = document.getElementById('stat-total');

    if (hasProfileId) {
        // Nạp thông tin cơ bản từ local trước cho nhanh
        document.getElementById('p-id').innerText = localUser.username || "Player";
        
        // Sau đó mới fetch dữ liệu thực tế từ Server
        await fetchStats(userId); 
        await renderProfile(userId);
        
        // Nếu có hệ thống thú cưng sản xuất tài nguyên
        if (typeof updateProduction === "function") updateProduction();
    }
});
