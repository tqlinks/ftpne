// --- script.js ---

// 1. Hàm hỗ trợ giao diện an toàn
const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

// 2. [Cập nhật] Lấy số liệu Dashboard
async function fetchStats() {
    try {
        const res = await fetch(CONFIG.SCRIPT_URL);
        const data = await res.json();
        setText('stat-total', data.total || 0);
        setText('stat-aion2', data.aion2 || 0);
        setText('stat-maple', data.maple || 0);
    } catch (e) { console.log("Lỗi tải Dashboard"); }
}

// 3. [Giữ nguyên] Xử lý Đăng nhập
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
            window.location.assign('profile.html');
        } else { alert(data.message); }
    } catch (e) { alert("Lỗi kết nối máy chủ!");
    } finally { btn.disabled = false; btn.innerText = "ĐĂNG NHẬP"; }
}

// 4. [Cập nhật] Tính toán và hiển thị Tiến độ
function updateProgressBar(idBar, idText, current, goal) {
    const bar = document.getElementById(idBar);
    const text = document.getElementById(idText);
    if (!bar || !text) return;
    
    current = Number(current) || 0;
    goal = Number(goal) || 0;
    
    let percent = 0;
    if (goal > 0) {
        percent = Math.min(100, Math.round((current / goal) * 100));
    }
    
    bar.style.width = percent + "%";
    text.innerText = percent + "%";
    
    // Đổi màu thanh nếu hoàn thành
    if (percent >= 100) {
        bar.classList.replace('bg-purple-600', 'bg-green-500'); // Kinah xong thì xanh
        bar.classList.add('animate-pulse'); // Thêm hiệu ứng nhấp nháy cho vui
    } else {
        bar.classList.add('bg-purple-600');
        bar.classList.remove('animate-pulse');
    }
}

// 5. [Giữ nguyên] Lưu sản lượng Kinah/Meso
async function updateProduction() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return window.location.assign('login.html');
    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const btn = document.getElementById('updateBtn');
    btn.disabled = true; btn.innerText = "Đang lưu...";
    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "update_prod", id: user.id, kinah: kinah, meso: meso })
        });
        user.kinah = kinah; user.meso = meso;
        localStorage.setItem('user', JSON.stringify(user));
        alert("Cập nhật sản lượng thành công!");
        window.location.reload(); // Reload để cập nhật thanh tiến độ
    } catch (e) { alert("Lỗi khi gửi dữ liệu!");
    } finally { btn.disabled = false; btn.innerText = "LƯU SẢN LƯỢNG MỚI"; }
}

// === PHẦN MỚI NÂNG CẤP ===

// 6. Logic mở/đóng Modal Sửa thông tin
function openEditModal() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    setVal('edit-phone', user.phone || "");
    setVal('edit-pc', user.pc || "");
    setVal('edit-avatar', user.avatar || "");
    
    const modal = document.getElementById('editModal');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.remove('scale-95');
    modal.children[0].classList.add('scale-100');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.remove('scale-100');
    modal.children[0].classList.add('scale-95');
}

// 7. Xử lý lưu hồ sơ người dùng mới
async function handleUpdateProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const phone = document.getElementById('edit-phone').value;
    const pc = document.getElementById('edit-pc').value;
    const avatar = document.getElementById('edit-avatar').value;

    const btn = document.querySelector('#editModal button[onclick="handleUpdateProfile()"]');
    btn.disabled = true; btn.innerText = "Đang cập nhật...";

    // Chức năng update hồ sơ cần viết API doPost riêng. 
    // Do chưa có, mình giả lập lưu nội bộ để test giao diện trước.
    try {
        // Sẽ fetch POST lên Apps Script: action: "update_profile"
        
        // Cập nhật local
        user.phone = phone;
        user.pc = pc;
        user.avatar = avatar;
        localStorage.setItem('user', JSON.stringify(user));
        
        alert("Thông tin hồ sơ đã được cập nhật!");
        closeEditModal();
        window.location.reload(); // Reload để nhận ảnh mới, PC mới
    } catch (e) { alert("Lỗi cập nhật!");
    } finally { btn.disabled = false; btn.innerText = "XÁC NHẬN CẬP NHẬT"; }
}

// 8. Logic quản lý Đen/Trắng (Dark Mode)
function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// === KHỞI CHẠY KHI MỞ TRANG ===
window.onload = () => {
    // A. Quản lý DarkMode (Nạp theme cũ)
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // B. TRANG INDEX
    if (document.getElementById('stat-total')) fetchStats();
    
    // C. TRANG PROFILE
    if (document.getElementById('p-id')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // Nạp thông tin cơ bản
            setText('p-id', user.id);
            setText('p-team', user.team);
            setText('p-game', user.game);
            setText('p-phone', user.phone || "Chưa cập nhật");
            setText('p-pc', user.pc || "Chưa phân công");
            setVal('input-kinah', user.kinah || 0);
            setVal('input-meso', user.meso || 0);
            
            // Nạp Avatar (Mới)
            const avatarEl = document.getElementById('p-avatar');
            if (user.avatar) avatarEl.src = user.avatar;

            // Nạp Mục tiêu và Thanh Tiến độ (Mới)
            setText('prog-k-current', user.kinah || 0);
            setText('prog-k-goal', user.kGoal || 0);
            updateProgressBar('bar-kinah', 'txt-bar-kinah', user.kinah, user.kGoal);

            setText('prog-m-current', user.meso || 0);
            setText('prog-m-goal', user.mGoal || 0);
            updateProgressBar('bar-meso', 'txt-bar-meso', user.meso, user.mGoal);

            // Nút ADMIN độc quyền của lyukikz (Giữ nguyên)
            if (user.role === 'admin') {
                const adminBtn = document.createElement('button');
                adminBtn.className = "w-full bg-slate-900 dark:bg-black text-white p-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2";
                adminBtn.innerHTML = '<i class="fas fa-user-shield text-yellow-400"></i> TRANG ADMIN';
                adminBtn.onclick = () => window.location.assign('admin.html');
                document.getElementById('updateBtn').after(adminBtn);
            }
        } else {
            window.location.assign('login.html'); // Chưa đăng nhập thì đá
        }
    }
};

function logout() { localStorage.removeItem('user'); window.location.href = 'login.html'; }
// ==========================================
// KHOẢNG MÃ DÀNH RIÊNG CHO QUẢN TRỊ (ADMIN)
// ==========================================

// 1. Tải dữ liệu chi tiết lên bảng Admin
async function fetchAdminDetailedData() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        const list = await res.json();
        
        tbody.innerHTML = list.map(u => {
            const avatarImg = u.avatar || 'https://i.pravatar.cc/150?u=' + u.id;
            
            // Tính % Kinah
            const kCurr = Number(u.kinah) || 0;
            const kGoal = Number(u.kGoal) || 0;
            const kPercent = kGoal > 0 ? Math.min(100, Math.round((kCurr / kGoal) * 100)) : 0;
            const kColor = kPercent >= 100 ? 'bg-green-500' : 'bg-purple-500';

            // Tính % Meso
            const mCurr = Number(u.meso) || 0;
            const mGoal = Number(u.mGoal) || 0;
            const mPercent = mGoal > 0 ? Math.min(100, Math.round((mCurr / mGoal) * 100)) : 0;
            const mColor = mPercent >= 100 ? 'bg-green-500' : 'bg-blue-500';

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition dark:text-gray-300">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${avatarImg}" class="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover">
                        <div>
                            <p class="font-black text-gray-800 dark:text-white">${u.id}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded">${u.team}</span><br>
                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block">${u.game}</span>
                </td>
                <td class="p-4">
                    <div class="flex justify-between text-xs mb-1">
                        <span class="font-bold">${kCurr} / ${kGoal} M</span>
                        <span class="text-purple-600 dark:text-purple-400 font-bold">${kPercent}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div class="${kColor} h-2 rounded-full" style="width: ${kPercent}%"></div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex justify-between text-xs mb-1">
                        <span class="font-bold">${mCurr} / ${mGoal} B</span>
                        <span class="text-blue-600 dark:text-blue-400 font-bold">${mPercent}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div class="${mColor} h-2 rounded-full" style="width: ${mPercent}%"></div>
                    </div>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500 font-bold">Lỗi tải dữ liệu!</td></tr>`;
    }
}

// 2. Cập nhật KPI cho Team
async function submitTeamGoals() {
    const team = document.getElementById('kpi-team').value;
    const kGoal = document.getElementById('kpi-kinah').value;
    const mGoal = document.getElementById('kpi-meso').value;
    const btn = document.getElementById('kpi-btn');

    if (!kGoal && !mGoal) return alert("Vui lòng nhập ít nhất 1 mục tiêu (Kinah hoặc Meso)!");

    btn.disabled = true; btn.innerText = "Đang xử lý...";

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "update_team_goals", team: team, kGoal: kGoal, mGoal: mGoal })
        });
        alert(`Đã cập nhật KPI thành công cho: ${team}`);
        document.getElementById('kpi-kinah').value = '';
        document.getElementById('kpi-meso').value = '';
        fetchAdminDetailedData(); // Tải lại bảng
    } catch (e) {
        alert("Lỗi khi gửi dữ liệu!");
    } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-check-double"></i> CẬP NHẬT KPI';
    }
}

// 3. SỬA LẠI HÀM WINDOW.ONLOAD ĐỂ CHẶN BẢO MẬT TRANG ADMIN
const originalOnload = window.onload;
window.onload = () => {
    if (originalOnload) originalOnload(); // Chạy các lệnh cũ (load Profile, Index)

    const user = JSON.parse(localStorage.getItem('user'));
    

    // Bổ sung nút Admin vào trang Profile (Nếu là Admin)
    // Bật nút Quản trị nếu tài khoản có quyền Admin
    if (document.getElementById('p-id') && user && user.role === 'admin') {
        const adminBtn = document.getElementById('admin-panel-btn');
        if (adminBtn) adminBtn.classList.remove('hidden');
    }

    // Bảo mật trang Admin
    if (document.getElementById('admin-dashboard')) {
        if (!user || user.role !== 'admin') {
            alert("CẢNH BÁO BẢO MẬT: Bạn không có quyền truy cập khu vực này!");
            window.location.replace('profile.html');
            return;
        }
        fetchAdminDetailedData();
    }
};

