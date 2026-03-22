import { WEB_APP_URL } from './config.js';

window.addEventListener('DOMContentLoaded', () => {
    // --- Điều hướng giao diện ---
    const show = (id) => {
        ['login-view', 'reg-view', 'profile-view'].forEach(v => 
            document.getElementById(v)?.classList.add('hidden')
        );
        document.getElementById(id)?.classList.remove('hidden');
    };

    document.getElementById('link-to-reg').onclick = () => show('reg-view');
    document.getElementById('link-to-login').onclick = () => show('login-view');

    // --- XỬ LÝ ĐĂNG KÝ ---
    document.getElementById('btn-register').onclick = async () => {
        const payload = {
            action: "register",
            username: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            team: document.getElementById('reg-team').value,
            game: document.getElementById('reg-game').value
        };

        if (!payload.username || !payload.email || !payload.phone) return alert("Vui lòng điền đủ thông tin!");

        const btn = document.getElementById('btn-register');
        btn.innerText = "Đang đồng bộ...";

        try {
            // Dùng mode no-cors để gửi dữ liệu thành công từ trình duyệt
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert("Đăng ký thành công! Dữ liệu đã gửi về Excel.");
            renderProfile({ ...payload, progress: 0, joinDate: new Date().toLocaleDateString("vi-VN") });
        } catch (e) {
            alert("Lỗi kết nối Server!");
        } finally { btn.innerText = "Tạo tài khoản"; }
    };

    // --- XỬ LÝ ĐĂNG NHẬP ---
    document.getElementById('btn-login').onclick = async () => {
        const id = document.getElementById('login-id').value.trim().toLowerCase();
        if (!id) return alert("Vui lòng nhập Email hoặc Tên!");

        const btn = document.getElementById('btn-login');
        btn.innerText = "Đang tìm kiếm...";

        try {
            const res = await fetch(WEB_APP_URL);
            const users = await res.json();
            const user = users.find(u => u.email.toLowerCase() === id || u.username.toLowerCase() === id);

            if (user) renderProfile(user);
            else alert("Tài khoản không tồn tại trong hệ thống!");
        } catch (e) {
            alert("Lỗi tải dữ liệu từ Excel!");
        } finally { btn.innerHTML = `<i class="fas fa-bolt"></i> Vào hệ thống`; }
    };

    // --- HIỂN THỊ PROFILE ---
    function renderProfile(user) {
        show('profile-view');
        document.getElementById('p-name').innerText = user.username;
        document.getElementById('p-details').innerHTML = `
            <div class="info-item"><span>Email:</span> <b>${user.email}</b></div>
            <div class="info-item"><span>SĐT:</span> <b>${user.phone || 'N/A'}</b></div>
            <div class="info-item"><span>Team:</span> <b>${user.team}</b></div>
            <div class="info-item"><span>Dự án:</span> <b>${user.game}</b></div>
            <div class="info-item"><span>Tham gia:</span> <b>${user.joinDate || 'N/A'}</b></div>
        `;

        const slider = document.getElementById('prog-slider');
        const label = document.getElementById('prog-percent');
        slider.value = user.progress || 0;
        label.innerText = (user.progress || 0) + "%";

        slider.oninput = () => label.innerText = slider.value + "%";

        document.getElementById('btn-save-prog').onclick = async () => {
            const saveBtn = document.getElementById('btn-save-prog');
            saveBtn.innerText = "Đang lưu...";
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: "update", email: user.email, progress: slider.value })
            });
            alert("Đã cập nhật tiến độ vào Excel!");
            saveBtn.innerText = "Lưu tiến độ";
        };
    }
});