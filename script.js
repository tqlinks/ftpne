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
// TRONG HÀM updateProduction(): Thêm lấy biến input-char45 và đẩy lên server
async function updateProduction() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return window.location.assign('login.html');

    // Lấy giá trị từ các ô nhập liệu
    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const char45 = document.getElementById('input-char45').value; // Lấy thêm số lượng nhân vật

    const btn = document.getElementById('updateBtn');
    
    // Vô hiệu hóa nút để tránh bấm nhiều lần
    btn.disabled = true; 
    btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> Đang lưu...';

    try {
        const response = await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Quan trọng để tránh lỗi CORS
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ 
                action: "update_prod", 
                id: user.id, 
                kinah: kinah, 
                meso: meso, 
                char45: char45 // Gửi lên Apps Script
            })
        });

        // Cập nhật lại bộ nhớ tạm trên máy nhân viên để hiển thị ngay
        user.kinah = kinah;
        user.meso = meso;
        user.char45 = char45;
        localStorage.setItem('user', JSON.stringify(user));

        alert("✅ Đã cập nhật sản lượng lên hệ thống!");
        window.location.reload(); // Load lại để cập nhật thanh tiến độ %
    } catch (e) {
        alert("❌ Lỗi kết nối: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> LƯU SẢN LƯỢNG MỚI';
    }
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
    loadDynamicTeams();
    // A. Quản lý DarkMode (Nạp theme cũ)
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // B. TRANG INDEX
    if (document.getElementById('stat-total')) fetchStats();
    
    // C. TRANG PROFILE
    // C. TRANG PROFILE (Hiển thị thông tin người dùng)
    if (document.getElementById('p-id')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // 1. Nạp thông tin cơ bản
            setText('p-id', user.id);
            setText('p-team', user.team);
            setText('p-game', user.game);
            setText('p-phone', user.phone || "Chưa cập nhật");
            setText('p-pc', user.pc || "Chưa phân công");
            
            // 2. Nạp Avatar 
            const avatarEl = document.getElementById('p-avatar');
            if (user.avatar) avatarEl.src = user.avatar;

            // 3. Nạp Sản lượng đã nhập
            setVal('input-kinah', user.kinah || 0);
            setVal('input-meso', user.meso || 0);
            setVal('input-char45', user.char45 || 0);

            // 4. Nạp Mục tiêu và Thanh Tiến độ 
            setText('prog-k-current', user.kinah || 0);
            setText('prog-k-goal', user.kGoal || 0);
            updateProgressBar('bar-kinah', 'txt-bar-kinah', user.kinah, user.kGoal);

            setText('prog-m-current', user.meso || 0);
            setText('prog-m-goal', user.mGoal || 0);
            updateProgressBar('bar-meso', 'txt-bar-meso', user.meso, user.mGoal);

            setText('prog-c-current', user.char45 || 0);
            setText('prog-c-goal', user.cGoal || 0);
            updateProgressBar('bar-char45', 'txt-bar-char45', user.char45, user.cGoal);

            // ==========================================
            // 5. NẠP ĐIỂM FPE VÀ KHÓA NÚT ĐIỂM DANH 
            // ==========================================
            setText('p-fpe', user.fpe || 0);

            const today = new Date().toLocaleDateString('vi-VN');
            const btnCheckIn = document.getElementById('btn-checkin');
            if (btnCheckIn && user.lastCheckIn === today) {
                btnCheckIn.disabled = true;
                btnCheckIn.innerHTML = '<i class="fas fa-check-circle"></i> ĐÃ ĐIỂM DANH';
                btnCheckIn.className = "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-5 py-3 rounded-xl font-black shadow-inner flex items-center gap-2 cursor-not-allowed";
            }

            // 6. Nút ADMIN độc quyền
            if (user.role === 'admin') {
                const adminBtn = document.getElementById('admin-panel-btn');
                if (adminBtn) adminBtn.classList.remove('hidden');
            }
            
        } else {
            // Chưa đăng nhập thì đá về trang login
            window.location.assign('login.html'); 
        }
    }
};

function logout() { localStorage.removeItem('user'); window.location.href = 'login.html'; }
// ==========================================
// KHOẢNG MÃ DÀNH RIÊNG CHO QUẢN TRỊ (ADMIN)
// ==========================================

// 1. Tải dữ liệu chi tiết lên bảng Admin
// Dòng 223 fix lỗi u is not defined
async function fetchAdminDetailedData() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        const list = await res.json();
        
        // Dòng 223: Fix lỗi triệt để bằng cách bọc biến u chính xác
        tbody.innerHTML = list.map(u => {
            const avatarImg = u.avatar || 'https://i.pravatar.cc/150?u=' + u.id;
            
            // Hàm tính % an toàn
            const getP = (curr, goal) => {
                const c = Number(curr) || 0;
                const g = Number(goal) || 0;
                return g > 0 ? Math.min(100, Math.round((c / g) * 100)) : 0;
            };

            const kP = getP(u.kinah, u.kGoal);
            const mP = getP(u.meso, u.mGoal);
            const cP = getP(u.char45, u.cGoal); // Tiến độ Acc Lv45

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition dark:text-gray-300 border-b dark:border-gray-700">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${avatarImg}" class="w-10 h-10 rounded-full border-2 border-gray-200 object-cover">
                        <span class="font-black text-gray-800 dark:text-white">${u.id}</span>
                    </div>
                </td>
                <td class="p-4 text-xs">
                    <span class="font-bold text-indigo-600">${u.team}</span><br>
                    <span class="text-gray-500">${u.pc || 'No PC'}</span>
                </td>
                <td class="p-4">
                    <div class="flex justify-between text-[10px] mb-1">
                        <span>${u.kinah}M</span><span class="font-bold">${kP}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full">
                        <div class="bg-purple-500 h-1.5 rounded-full" style="width: ${kP}%"></div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex justify-between text-[10px] mb-1">
                        <span>${u.meso}B</span><span class="font-bold">${mP}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full">
                        <div class="bg-green-500 h-1.5 rounded-full" style="width: ${mP}%"></div>
                    </div>
                </td>
                <td class="p-4 text-center">
                    <div class="flex justify-between text-[10px] mb-1">
                        <span class="font-bold text-orange-600">${u.char45} / ${u.cGoal} Acc</span>
                        <span class="font-bold text-orange-600">${cP}%</span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-600 h-2 rounded-full overflow-hidden border dark:border-gray-700">
                        <div class="bg-orange-500 h-full transition-all duration-500 ${cP >= 100 ? 'animate-pulse' : ''}" style="width: ${cP}%"></div>
                    </div>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500 font-bold">Lỗi tải dữ liệu: ${e.message}</td></tr>`;
    }
}

// 2. Cập nhật KPI cho Team
// TRONG HÀM submitTeamGoals(): Thêm gửi kpi-char45
async function submitTeamGoals() {
    const team = document.getElementById('kpi-team').value;
    const kGoal = document.getElementById('kpi-kinah').value;
    const mGoal = document.getElementById('kpi-meso').value;
    const cGoal = document.getElementById('kpi-char45').value; // MỚI
    const btn = document.getElementById('kpi-btn');

    if (!kGoal && !mGoal && !cGoal) return alert("Vui lòng nhập ít nhất 1 mục tiêu!");
    btn.disabled = true; btn.innerText = "Đang xử lý...";
    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "update_team_goals", team: team, kGoal: kGoal, mGoal: mGoal, cGoal: cGoal }) // GỬI THÊM cGoal
        });
        alert(`Đã cập nhật KPI thành công cho: ${team}`);
        document.getElementById('kpi-kinah').value = '';
        document.getElementById('kpi-meso').value = '';
        document.getElementById('kpi-char45').value = '';
        fetchAdminDetailedData(); 
    } catch (e) { alert("Lỗi khi gửi dữ liệu!"); } 
    finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check-double"></i> CẬP NHẬT KPI'; }
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
// ==========================================
// KHU VỰC: QUẢN LÝ NHÂN SỰ (manage.html)
// ==========================================

let globalUsersList = []; // Lưu tạm danh sách để dễ lấy dữ liệu đổ vào Modal

// 1. Tải danh sách thành viên lên bảng
// Căn chỉnh lại giao diện 6 cột cho Manage.html
async function fetchManageData() {
    const tbody = document.getElementById('manage-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        globalUsersList = await res.json();
        
        tbody.innerHTML = globalUsersList.map(u => {
            const avatarImg = u.avatar || 'https://i.pravatar.cc/150?u=' + u.id;
            
            // Huy hiệu phân quyền
            const roleBadge = u.role === 'admin' 
                ? `<span class="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full border border-red-200 dark:border-red-800"><i class="fas fa-crown"></i> Admin</span>`
                : `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-full border border-gray-200 dark:border-gray-600">User</span>`;

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition dark:text-gray-300 border-b dark:border-gray-700">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${avatarImg}" class="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover shadow-sm">
                        <div>
                            <p class="font-black text-gray-800 dark:text-white">${u.id}</p>
                            <p class="text-[10px] text-gray-500">${u.email || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                </td>
                
                <td class="p-4 text-xs">
                    <p class="mb-1"><i class="fas fa-phone-alt text-gray-400 w-4"></i> ${u.phone || '---'}</p>
                    <p class="font-bold text-indigo-600 dark:text-indigo-400"><i class="fas fa-desktop text-gray-400 w-4"></i> ${u.pc || 'Chưa xếp máy'}</p>
                </td>
                
                <td class="p-4 text-xs">
                    <p class="font-bold text-gray-700 dark:text-gray-300 mb-1"><i class="fas fa-users text-gray-400 w-4"></i> ${u.team || '---'}</p>
                    <p class="font-medium text-orange-500"><i class="fas fa-gamepad text-gray-400 w-4"></i> ${u.game || '---'}</p>
                </td>
                
                <td class="p-4 text-center">
                    <span class="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded font-bold text-xs border border-orange-200 dark:border-orange-800">
                        ${u.char45 || 0}
                    </span>
                </td>
                
                <td class="p-4 text-center">
                    ${roleBadge}
                </td>
                
                <td class="p-4 text-center">
                    <button onclick="openAdminEditModal('${u.id}')" class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg font-bold transition text-xs shadow-sm border border-indigo-100 dark:border-indigo-800">
                        <i class="fas fa-user-edit"></i> Sửa
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500 font-bold">Lỗi tải dữ liệu: ${e.message}</td></tr>`;
    }
}

// 2. Mở Modal và Đổ dữ liệu
// Dòng 407 fix lỗi toLowerCase
function openAdminEditModal(targetId) {
    // Tìm nhân viên trong danh sách đã tải về
    const userToEdit = globalUsersList.find(u => String(u.id).trim() === String(targetId).trim());
    
    if (!userToEdit) {
        alert("Không tìm thấy dữ liệu nhân viên này!");
        return;
    }

    // Đổ dữ liệu vào Modal
    setText('edit-m-id', userToEdit.id);
    setText('edit-m-email', userToEdit.email || "Chưa có email");
    setVal('edit-m-phone', userToEdit.phone || '');
    setVal('edit-m-pc', userToEdit.pc || '');
    setVal('edit-m-team', userToEdit.team);
    setVal('edit-m-game', userToEdit.game);
    setVal('edit-m-role', userToEdit.role || 'user');
    
    // Kiểm tra an toàn trước khi dùng toLowerCase
    const userEmail = String(userToEdit.email || "").toLowerCase();
    if (userEmail === 'lyukikz@gmail.com') {
        document.getElementById('edit-m-role').disabled = true;
    } else {
        document.getElementById('edit-m-role').disabled = false;
    }

    const modal = document.getElementById('adminEditModal');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.replace('scale-95', 'scale-100');
}

function closeAdminEditModal() {
    const modal = document.getElementById('adminEditModal');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.remove('scale-100');
    modal.children[0].classList.add('scale-95');
}

// 3. Gửi lệnh cập nhật lên Apps Script
async function submitAdminUserUpdate() {
    const btn = document.getElementById('btn-save-manage');
    btn.disabled = true; btn.innerText = "Đang lưu...";

    const payload = {
        action: "update_user_admin",
        targetId: document.getElementById('edit-m-id').innerText,
        phone: document.getElementById('edit-m-phone').value,
        pc: document.getElementById('edit-m-pc').value,
        team: document.getElementById('edit-m-team').value,
        game: document.getElementById('edit-m-game').value,
        role: document.getElementById('edit-m-role').value
    };

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        alert(`Đã cập nhật thông tin cho ${payload.targetId} thành công!`);
        closeAdminEditModal();
        fetchManageData(); // Tải lại bảng để xem quyền mới
    } catch (e) {
        alert("Lỗi mạng khi lưu dữ liệu!");
    } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> LƯU THAY ĐỔI';
    }
}

// Tích hợp load trang manage
const oldManageOnload = window.onload;
window.onload = () => {
    if (oldManageOnload) oldManageOnload();

    const user = JSON.parse(localStorage.getItem('user'));
    
    // Tích hợp thêm nút "Quản lý Nhân Sự" vào trang admin.html
    if (document.getElementById('admin-dashboard')) {
        const headerDiv = document.querySelector('#admin-dashboard .flex.gap-3');
        if (headerDiv && !document.getElementById('btn-manage-users')) {
            const manageBtn = document.createElement('button');
            manageBtn.id = 'btn-manage-users';
            manageBtn.className = "bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow";
            manageBtn.innerHTML = '<i class="fas fa-users-cog"></i> Quản Lý Nhân Sự';
            manageBtn.onclick = () => window.location.assign('manage.html');
            headerDiv.prepend(manageBtn); // Nhét vào đầu cụm nút
        }
    }

    // Bảo mật trang manage.html
    if (document.getElementById('manage-dashboard')) {
        if (!user || user.role !== 'admin') {
            alert("CẢNH BÁO: Chỉ Admin mới được vào khu vực này!");
            window.location.replace('profile.html');
            return;
        }
        fetchManageData();
    }
};
// ==========================================
// KẾT NỐI DANH SÁCH TEAM ĐỘNG (DYNAMIC TEAMS)
// ==========================================

// 1. Hàm tự động quét và đổ danh sách Team vào tất cả thẻ Select
async function loadDynamicTeams() {
    // Quét tìm tất cả các menu thả xuống có id chứa chữ "-team" 
    // (Bao gồm: reg-team ở Đăng ký, kpi-team ở Admin, edit-m-team ở Manage)
    const selects = document.querySelectorAll('select[id$="-team"]'); 
    if (selects.length === 0) return; 

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_teams`);
        const teams = await res.json();
        
        selects.forEach(select => {
            const currentValue = select.value; // Giữ lại giá trị đang chọn
            
            // Nếu là trang Admin set KPI, phải luôn có tùy chọn "Tất cả"
            let html = select.id === 'kpi-team' 
                ? '<option value="All">Tất cả nhân viên (All Teams)</option>' 
                : '';
            
            // Đổ danh sách team vào
            teams.forEach(t => {
                html += `<option value="${t}">${t}</option>`;
            });
            
            select.innerHTML = html;
            
            // Trả lại giá trị cũ nếu nó vẫn tồn tại trong danh sách
            if (currentValue && (teams.includes(currentValue) || currentValue === 'All')) {
                select.value = currentValue;
            }
        });
    } catch(e) { console.log("Không thể tải danh sách Team tự động", e); }
}

// 2. Hàm cho Admin tạo Team mới
async function createNewTeam() {
    const newTeam = prompt("Nhập tên Team mới của bạn\n(Ví dụ: Team Cày Đêm, Team Hoc Mon, Team C...):");
    if (!newTeam || newTeam.trim() === "") return;

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "add_team", newTeam: newTeam.trim() })
        });
        alert(`Đã thêm [${newTeam}] vào hệ thống!`);
        
        // Gọi lại hàm load để cập nhật menu thả xuống ngay lập tức
        loadDynamicTeams(); 
    } catch(e) { alert("Lỗi mạng! Không thể thêm Team."); }
}

// CHÚ Ý: Bắt sự kiện tải trang để load danh sách Team
// Bạn hãy tìm đến hàm window.onload hiện tại của bạn, và thêm dòng `loadDynamicTeams();` vào ngay dòng đầu tiên bên trong nó.

// --- XỬ LÝ ĐIỂM DANH NHẬN FPE ---
async function handleCheckIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const today = new Date().toLocaleDateString('vi-VN'); // Lấy ngày VN hiện tại
    const btn = document.getElementById('btn-checkin');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "check_in", id: user.id, todayDate: today })
        });
        
        // Cộng tạm vào LocalStorage để hiển thị ngay lập tức
        user.fpe = (Number(user.fpe) || 0) + 5;
        user.lastCheckIn = today;
        localStorage.setItem('user', JSON.stringify(user));
        
        alert("🎉 Điểm danh thành công! Bạn nhận được +5 Fpe.");
        window.location.reload(); // Tải lại trang để cập nhật nút
    } catch (e) {
        alert("Lỗi mạng! Không thể điểm danh.");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> ĐIỂM DANH';
    }
}
// ==========================================
// KHU VỰC: CỬA HÀNG LINH THÚ (shop.html)
// ==========================================

const eleColors = {
    "Hỏa": "bg-red-500", "Thủy": "bg-blue-500", "Phong": "bg-teal-400", 
    "Thổ": "bg-amber-700", "Lôi": "bg-purple-500", "Ám": "bg-gray-800 text-white",
    "Quang": "bg-yellow-400 text-yellow-900", "Băng": "bg-cyan-400", "Mộc": "bg-green-500",
    "Kim": "bg-slate-400", "Độc": "bg-lime-500", "Không Gian": "bg-black text-purple-400 border border-purple-500"
};

let currentSelectedPet = null;
let currentFilter = 'All';

// 1. Render danh sách Linh thú có bộ lọc
function renderShop(filterElement = 'All') {
    currentFilter = filterElement;
    const grid = document.getElementById('pet-grid');
    if (!grid) return;

    const user = JSON.parse(localStorage.getItem('user'));
    setText('shop-fpe', user ? user.fpe : 0);
    
    // Lấy ID pet đã mua
    const ownedPets = user && user.pets ? String(user.pets).split(',') : [];

    // Cập nhật giao diện nút Filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.innerText.includes(filterElement) || (filterElement === 'All' && btn.innerText === 'Tất Cả')) {
            btn.className = "filter-btn shrink-0 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-md transform scale-105";
        } else {
            btn.className = "filter-btn shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-xl font-bold text-xs transition-colors";
        }
    });

    // Lọc dữ liệu
    const filteredPets = filterElement === 'All' 
        ? PET_DATABASE 
        : PET_DATABASE.filter(p => p.element === filterElement);

    if (filteredPets.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500 dark:text-gray-400 font-bold">Chưa có linh thú hệ ${filterElement} nào.</div>`;
        return;
    }

    grid.innerHTML = filteredPets.map(pet => {
        const isOwned = ownedPets.includes(pet.id);
        const colorClass = eleColors[pet.element] || "bg-gray-500";
        
        return `
        <div onclick="openPetDetails('${pet.id}')" class="pet-card bg-white dark:bg-gray-800 rounded-2xl p-3 border-2 border-transparent dark:border-gray-700 cursor-pointer relative overflow-hidden group flex flex-col h-full">
            ${isOwned ? `<div class="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-md z-10 shadow"><i class="fas fa-check"></i> ĐÃ CÓ</div>` : ''}
            
            <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-2 mb-2 relative flex justify-center items-center h-28 border border-gray-100 dark:border-gray-800">
                <img src="${pet.img}" alt="${pet.name}" class="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                <span class="absolute bottom-1 left-1 ${colorClass} text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">${pet.element}</span>
            </div>
            
            <div class="flex-grow flex flex-col justify-between">
                <div>
                    <h3 class="font-black text-gray-800 dark:text-white text-sm truncate" title="${pet.name}">${pet.name}</h3>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">Mã: ${pet.id}</p>
                </div>
                <div class="mt-2 text-right">
                    <span class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-black px-2 py-1 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
                        ${pet.price} <i class="fas fa-coins text-[10px]"></i>
                    </span>
                </div>
            </div>
        </div>`;
    }).join('');
}

// 2. Mở Modal Chi tiết Linh Thú
function openPetDetails(id) {
    const pet = PET_DATABASE.find(p => p.id === id);
    if (!pet) return;
    
    currentSelectedPet = pet;
    const user = JSON.parse(localStorage.getItem('user'));
    const isOwned = user.pets && String(user.pets).split(',').includes(pet.id);
    const canAfford = Number(user.fpe) >= pet.price;
    const colorClass = eleColors[pet.element] || "bg-gray-500";

    const modalContent = document.getElementById('petModalContent');
    modalContent.innerHTML = `
        <div class="${colorClass} p-6 relative flex flex-col items-center border-b-4 border-black/20 text-white">
            <button onclick="closePetModal()" class="absolute top-3 right-3 text-white/70 hover:text-white text-2xl drop-shadow"><i class="fas fa-times-circle"></i></button>
            <div class="bg-white/20 p-2 rounded-full backdrop-blur-sm border-4 border-white/30 drop-shadow-xl mb-3">
                <img src="${pet.img}" class="w-24 h-24 object-contain">
            </div>
            <h2 class="text-xl font-black uppercase tracking-wider text-center">${pet.name}</h2>
            <div class="flex gap-2 mt-2">
                <span class="bg-black/40 text-[10px] px-3 py-1 rounded-full font-bold uppercase border border-white/20">Hệ: ${pet.element}</span>
                <span class="bg-black/40 text-[10px] px-3 py-1 rounded-full font-bold uppercase border border-white/20">ID: ${pet.id}</span>
            </div>
        </div>
        
        <div class="p-5 bg-slate-50 dark:bg-gray-800">
            <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><i class="fas fa-chart-bar"></i> Chỉ số Cơ bản</p>
            <div class="grid grid-cols-3 gap-2 text-[11px] font-bold mb-4">
                <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 flex flex-col"><span class="text-[9px] text-gray-500 mb-0.5">HP</span><span><i class="fas fa-heart"></i> ${pet.stats.hp}</span></div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex flex-col"><span class="text-[9px] text-gray-500 mb-0.5">MP</span><span><i class="fas fa-tint"></i> ${pet.stats.mp}</span></div>
                <div class="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 flex flex-col"><span class="text-[9px] text-gray-500 mb-0.5">ATK</span><span><i class="fas fa-khanda"></i> ${pet.stats.atk}</span></div>
                <div class="bg-gray-200 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex flex-col"><span class="text-[9px] text-gray-500 mb-0.5">DEF</span><span><i class="fas fa-shield-alt"></i> ${pet.stats.def}</span></div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-800/50 text-yellow-600 dark:text-yellow-400 flex flex-col"><span class="text-[9px] text-gray-500 mb-0.5">CRIT</span><span><i class="fas fa-bolt"></i> ${pet.stats.crit}%</span></div>
                <div class="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-100 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex flex-col"><span class="text-[9px] text-gray-500 mb-0.5">DMG</span><span><i class="fas fa-burn"></i> ${pet.stats.dmg}%</span></div>
            </div>

            <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><i class="fas fa-arrow-up"></i> Tăng Trưởng (Mỗi Cấp)</p>
            <div class="flex justify-between text-[10px] font-bold text-gray-600 dark:text-gray-300 mb-4 bg-white dark:bg-gray-700 p-2.5 rounded-lg border dark:border-gray-600 shadow-sm">
                <span class="text-red-500">+${pet.growth.hp} HP</span>
                <span class="text-blue-500">+${pet.growth.mp} MP</span>
                <span class="text-orange-500">+${pet.growth.atk} ATK</span>
                <span class="text-gray-500">+${pet.growth.def} DEF</span>
            </div>

            <div class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-5 relative overflow-hidden">
                <div class="absolute -right-4 -top-4 opacity-10"><i class="fas fa-star text-6xl text-indigo-500"></i></div>
                <p class="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest mb-1 relative z-10">Kỹ Năng Kích Hoạt</p>
                <p class="text-sm font-bold text-gray-700 dark:text-gray-300 relative z-10 leading-snug">"${pet.skill}"</p>
            </div>

            ${isOwned ? 
                `<button disabled class="w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3.5 rounded-xl font-black cursor-not-allowed border dark:border-gray-600 flex justify-center items-center gap-2"><i class="fas fa-lock"></i> ĐÃ SỞ HỮU</button>` : 
             canAfford ? 
                `<button id="btn-buy-pet" onclick="buyCurrentPet()" class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3.5 rounded-xl font-black hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex justify-center items-center gap-2 border border-orange-400">CHIÊU MỘ - ${pet.price} <i class="fas fa-coins"></i></button>` :
                `<button disabled class="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 py-3.5 rounded-xl font-black cursor-not-allowed border border-red-200 dark:border-red-800 flex justify-center items-center gap-2"><i class="fas fa-exclamation-triangle"></i> THIẾU FPE</button>`
            }
        </div>
    `;

    const modal = document.getElementById('petModal');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.replace('scale-95', 'scale-100');
}

function closePetModal() {
    const modal = document.getElementById('petModal');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.replace('scale-100', 'scale-95');
}

// 3. Xử lý mua
async function buyCurrentPet() {
    if (!currentSelectedPet) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const btn = document.getElementById('btn-buy-pet');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG KHẾ ƯỚC...';

    try {
        const res = await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "buy_pet", id: user.id, petId: currentSelectedPet.id, price: currentSelectedPet.price })
        });
        
        user.fpe -= currentSelectedPet.price;
        user.pets = user.pets ? user.pets + "," + currentSelectedPet.id : currentSelectedPet.id;
        localStorage.setItem('user', JSON.stringify(user));

        alert(`🎉 KHẾ ƯỚC THÀNH CÔNG!\nBạn đã nhận được linh thú [${currentSelectedPet.name}]!`);
        closePetModal();
        renderShop(currentFilter); // Giữ nguyên bộ lọc sau khi mua
    } catch (e) {
        alert("Lỗi kết nối máy chủ! Không thể chiêu mộ.");
        btn.disabled = false;
        btn.innerHTML = `CHIÊU MỘ - ${currentSelectedPet.price} FPE`;
    }
}

// Khởi tạo trang shop
const oldShopOnload = window.onload;
window.onload = () => {
    if (oldShopOnload) oldShopOnload();
    if (document.getElementById('pet-grid')) renderShop();
};
// ==========================================
// KHU VỰC: ĐẤU TRƯỜNG LINH THÚ (arena.html)
// ==========================================

let playerPet = null;
let enemyPet = null;
let isBattling = false;

// 1. Tải linh thú bạn đang có
function loadArena() {
    const list = document.getElementById('owned-pets-list');
    if (!list) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const ownedIds = user && user.pets ? String(user.pets).split(',') : [];
    
    if (ownedIds.length === 0) {
        list.innerHTML = `<p class="text-sm text-gray-500">Bạn chưa có linh thú nào. Hãy vào Shop mua nhé!</p>`;
        return;
    }

    const ownedPets = PET_DATABASE.filter(p => ownedIds.includes(p.id));
    list.innerHTML = ownedPets.map(p => `
        <div onclick="selectMyPet('${p.id}')" class="shrink-0 cursor-pointer group text-center">
            <img src="${p.img}" class="w-16 h-16 rounded-full bg-gray-800 border-2 border-transparent group-hover:border-blue-500 transition-all p-1">
            <p class="text-[9px] mt-1 font-bold text-gray-400 group-hover:text-blue-400">${p.name}</p>
        </div>
    `).join('');

    // Tự động chọn linh thú máy ngẫu nhiên
    selectEnemyPet();
}

// 2. Chọn linh thú của mình
function selectMyPet(id) {
    if (isBattling) return;
    const pet = PET_DATABASE.find(p => p.id === id);
    playerPet = { ...pet, currentHp: pet.stats.hp };
    
    document.getElementById('p-img').src = pet.img;
    document.getElementById('p-name').innerText = pet.name;
    updateHp('p', playerPet.currentHp, pet.stats.hp);
}

// 3. Chọn đối thủ ngẫu nhiên (Máy)
function selectEnemyPet() {
    const randomPet = PET_DATABASE[Math.floor(Math.random() * PET_DATABASE.length)];
    enemyPet = { ...randomPet, currentHp: randomPet.stats.hp };
    
    document.getElementById('e-img').src = randomPet.img;
    document.getElementById('e-name').innerText = randomPet.name;
    updateHp('e', enemyPet.currentHp, randomPet.stats.hp);
}

// 4. Cập nhật thanh máu
function updateHp(side, current, max) {
    const percent = Math.max(0, (current / max) * 100);
    document.getElementById(`${side}-hp-bar`).style.width = percent + '%';
    document.getElementById(`${side}-hp-text`).innerText = `${current}/${max}`;
}

// 5. Logic Chiến đấu (Turn-based)
async function startBattle() {
    if (!playerPet || isBattling) return alert("Vui lòng chọn linh thú!");
    
    isBattling = true;
    const log = document.getElementById('battle-log');
    log.innerHTML = `<p class="text-yellow-400 font-bold">--- TRẬN ĐẤU BẮT ĐẦU ---</p>`;
    
    while (playerPet.currentHp > 0 && enemyPet.currentHp > 0) {
        // Lượt của Bạn
        await attack(playerPet, enemyPet, 'e');
        if (enemyPet.currentHp <= 0) break;
        
        await sleep(1000);

        // Lượt của Máy
        await attack(enemyPet, playerPet, 'p');
        if (playerPet.currentHp <= 0) break;
        
        await sleep(1000);
    }

    const winner = playerPet.currentHp > 0 ? "BẠN CHIẾN THẮNG!" : "BẠN ĐÃ THẤT BẠI!";
    log.innerHTML += `<p class="text-2xl font-black text-center mt-4 ${playerPet.currentHp > 0 ? 'text-green-500' : 'text-red-500'}">${winner}</p>`;
    isBattling = false;
}

async function attack(attacker, defender, defSide) {
    const log = document.getElementById('battle-log');
    const sideName = defSide === 'e' ? 'Bạn' : 'Đối thủ';
    
    // Tính sát thương: (ATK - DEF/2) * (Crit? 2 : 1)
    let isCrit = Math.random() * 100 < attacker.stats.crit;
    let damage = Math.max(10, attacker.stats.atk - (defender.stats.def / 2));
    if (isCrit) damage = Math.round(damage * (attacker.stats.dmg / 100));

    defender.currentHp -= Math.round(damage);
    updateHp(defSide, defender.currentHp, defender.stats.hp);
    
    // Hiệu ứng rung màn hình khi trúng đòn
    document.getElementById(`${defSide}-side`).classList.add('shake');
    setTimeout(() => document.getElementById(`${defSide}-side`).classList.remove('shake'), 500);

    log.innerHTML += `<p><span class="text-blue-400 font-bold">${attacker.name}</span> tấn công: <span class="${isCrit ? 'text-red-500 font-black' : 'text-white'}">${Math.round(damage)} ST ${isCrit ? '(CHÍ MẠNG!)' : ''}</span></p>`;
    log.scrollTop = log.scrollHeight;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Tự động chạy khi vào arena.html
const oldArenaOnload = window.onload;
window.onload = () => {
    if (oldArenaOnload) oldArenaOnload();
    if (document.getElementById('owned-pets-list')) loadArena();
};
