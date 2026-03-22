import { WEB_APP_URL } from './config.js';

window.addEventListener('DOMContentLoaded', () => {
    const views = {
        login: document.getElementById('login-view'),
        reg: document.getElementById('reg-view'),
        profile: document.getElementById('profile-view')
    };

    const show = (v) => {
        Object.keys(views).forEach(k => views[k]?.classList.add('hidden'));
        views[v]?.classList.remove('hidden');
    };

    document.getElementById('link-to-reg').onclick = () => show('reg');
    document.getElementById('link-to-login').onclick = () => show('login');

    // ĐĂNG NHẬP
    document.getElementById('btn-login').onclick = async () => {
        const id = document.getElementById('login-id').value.trim().toLowerCase();
        const pw = document.getElementById('login-pass').value;
        const btn = document.getElementById('btn-login');

        btn.innerText = "Đang kiểm tra...";
        try {
            const res = await fetch(WEB_APP_URL);
            const users = await res.json();
            const user = users.find(u => (u.email.toLowerCase() === id || u.username.toLowerCase() === id) && String(u.password) === pw);

            if (user) {
                renderProfile(user);
            } else {
                alert("Thông tin không chính xác!");
            }
        } catch (e) { alert("Lỗi tải dữ liệu!"); }
        finally { btn.innerText = "Vào hệ thống"; }
    };

    function renderProfile(user) {
        show('profile');
        document.getElementById('p-name').innerText = user.username;
        document.getElementById('p-avatar').src = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`;
        document.getElementById('p-details').innerHTML = `
            <p>Email: ${user.email}</p>
            <p>Số máy: <b>${user.pcNumber || 'N/A'}</b></p>
            <p>Dự án: ${user.team} - ${user.game}</p>
        `;

        document.getElementById('btn-toggle-edit').onclick = () => document.getElementById('edit-form').classList.toggle('hidden');

        document.getElementById('btn-save-info').onclick = async () => {
            const data = {
                action: "update_info",
                email: user.email,
                phone: document.getElementById('edit-phone').value,
                pcNumber: document.getElementById('edit-pc').value,
                avatarUrl: document.getElementById('edit-avatar').value
            };
            await fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
            alert("Đã cập nhật!");
            location.reload();
        };

        const slider = document.getElementById('prog-slider');
        slider.value = user.progress || 0;
        document.getElementById('prog-percent').innerText = slider.value + "%";
        slider.oninput = () => document.getElementById('prog-percent').innerText = slider.value + "%";

        document.getElementById('btn-save-prog').onclick = async () => {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: "update", email: user.email, progress: slider.value })
            });
            alert("Đã lưu tiến độ!");
        };
    }

    // ĐĂNG KÝ
    document.getElementById('btn-register').onclick = async () => {
        const payload = {
            action: "register",
            username: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            pcNumber: document.getElementById('reg-pc').value,
            password: document.getElementById('reg-pass').value,
            team: document.getElementById('reg-team').value,
            game: document.getElementById('reg-game').value
        };
        await fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        alert("Đăng ký thành công!");
        location.reload();
    };
});
