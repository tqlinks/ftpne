// --- profile.js ---

// Hàm cập nhật thanh tiến độ an toàn
function updateProgressBar(idBar, idText, current, goal) {
    const bar = document.getElementById(idBar);
    const text = document.getElementById(idText);
    if (!bar || !text) return; // Bảo vệ nếu Element bị xóa

    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    bar.style.width = percentage + "%";
    text.innerText = current.toLocaleString(); 
    // Nếu goal cũng cần hiển thị động, bạn có thể update thêm ở đây
}

async function updateProduction() {
    const kinah = document.getElementById('input-kinah').value;
    const charCount = document.getElementById('input-char45').value;
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) return alert("Vui lòng đăng nhập lại!");

    try {
        // Giả sử bạn dùng Firestore
        // await updateDoc(doc(db, "users", user.uid), { 
        //    lastKinah: Number(kinah), 
        //    activeChars: Number(charCount),
        //    lastUpdate: new Date() 
        // });
        alert("Đã cập nhật sản lượng Kinah!");
    } catch (e) {
        console.error("Lỗi cập nhật:", e);
    }
}

// Logic khởi chạy khi trang load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.assign('login.html');
        return;
    }

    // Hiển thị thông tin cơ bản
    if (document.getElementById('p-id')) {
        document.getElementById('p-id').innerText = user.username || "N/A";
        document.getElementById('p-team').innerText = user.team || "Chưa rõ";
        document.getElementById('p-game').innerText = user.game || "AION2";
        if (user.avatar) document.getElementById('p-avatar').src = user.avatar;
    }

    // Gọi dữ liệu từ server
    fetchStats(user.uid);
    renderProfile(user.uid);
});
