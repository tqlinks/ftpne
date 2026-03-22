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
    const kinah = document.getElementById('input-kinah').value;
    const meso = document.getElementById('input-meso').value;
    const char45 = document.getElementById('input-char45').value; // MỚI
    const btn = document.getElementById('updateBtn');
    
    btn.disabled = true; btn.innerText = "Đang lưu...";
    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: "update_prod", id: user.id, kinah: kinah, meso: meso, char45: char45 }) // GỬI THÊM CHAR45
        });
        user.kinah = kinah; user.meso = meso; user.char45 = char45; // Lưu vào biến cục bộ
        localStorage.setItem('user', JSON.stringify(user));
        alert("Cập nhật sản lượng thành công!");
        window.location.reload(); 
    } catch (e) { alert("Lỗi khi gửi dữ liệu!"); } 
    finally { btn.disabled = false; btn.innerText = "LƯU SẢN LƯỢNG MỚI"; }
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
            setVal('input-char45', user.char45 || 0);

            // ... (Dưới updateProgressBar meso)
            setText('prog-c-current', user.char45 || 0);
            setText('prog-c-goal', user.cGoal || 0);
            updateProgressBar('bar-char45', 'txt-bar-char45', user.char45, user.cGoal);
            
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
// Dòng 223 fix lỗi u is not defined
async function fetchAdminDetailedData() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        const list = await res.json();
        
        tbody.innerHTML = list.map(u => {
            // Định nghĩa an toàn các biến từ đối tượng u
            const avatarImg = u.avatar || 'https://i.pravatar.cc/150?u=' + u.id;
            
            // Tính toán % tiến độ
            const calc = (curr, goal) => {
                const c = Number(curr) || 0;
                const g = Number(goal) || 0;
                return g > 0 ? Math.min(100, Math.round((c / g) * 100)) : 0;
            };

            const kP = calc(u.kinah, u.kGoal);
            const mP = calc(u.meso, u.mGoal);
            const cP = calc(u.char45, u.cGoal); // Mới: Tiến độ Lv45

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition dark:text-gray-300 border-b dark:border-gray-700">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${avatarImg}" class="w-10 h-10 rounded-full border shadow-sm object-cover">
                        <span class="font-black">${u.id}</span>
                    </div>
                </td>
                <td class="p-4 text-xs">
                    <b class="text-indigo-600">${u.team}</b><br>${u.pc || 'No PC'}
                </td>
                <td class="p-4">
                    <div class="flex justify-between text-[10px] mb-1">
                        <span>${u.kinah}/${u.kGoal}M</span><span class="font-bold">${kP}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full">
                        <div class="bg-purple-500 h-1.5 rounded-full" style="width: ${kP}%"></div>
                    </div>
                </td>
                <td class="p-4 text-center font-bold text-orange-500">
                    ${u.char45} <small class="text-gray-400">/ ${u.cGoal}</small>
                    <div class="w-full bg-gray-100 dark:bg-gray-600 h-1 rounded-full mt-1">
                        <div class="bg-orange-500 h-1 rounded-full" style="width: ${cP}%"></div>
                    </div>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Lỗi: ${e.message}</td></tr>`;
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
async function fetchManageData() {
    const tbody = document.getElementById('manage-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        globalUsersList = await res.json();
        
        tbody.innerHTML = globalUsersList.map(u => {
            const avatarImg = u.avatar || 'https://i.pravatar.cc/150?u=' + u.id;
            const roleBadge = u.role === 'admin' 
                ? `<span class="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800"><i class="fas fa-crown"></i> Admin</span>`
                : `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-600">User</span>`;

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition dark:text-gray-300">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${avatarImg}" class="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover">
                        <div>
                            <p class="font-black text-gray-800 dark:text-white">${u.id}</p>
                            <p class="text-xs text-gray-500">${u.email}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <p class="text-sm font-medium"><i class="fas fa-phone-alt text-gray-400 w-4"></i> ${u.phone || '---'}</p>
                    <p class="text-sm font-bold text-indigo-600 dark:text-indigo-400"><i class="fas fa-desktop text-gray-400 w-4"></i> ${u.pc || '---'}</p>
                </td>
                <td class="p-4">
                    <p class="font-bold text-gray-700 dark:text-gray-300">${u.team}</p>
                    <p class="text-xs text-orange-500 font-medium">${u.game}</p>
                </td>
                <td class="p-4">${roleBadge}</td>
                <td class="p-4 text-center">
                    <button onclick="openAdminEditModal('${u.id}')" class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-lg font-bold transition text-xs shadow-sm border border-indigo-100 dark:border-indigo-800">
                        <i class="fas fa-user-edit"></i> Sửa
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500 font-bold">Lỗi tải dữ liệu!</td></tr>`;
    }
}

// 2. Mở Modal và Đổ dữ liệu
function openAdminEditModal(targetId) {
    const user = globalUsersList.find(u => u.id === targetId);
    if (!user) return;

    setText('edit-m-id', user.id);
    setText('edit-m-email', user.email);
    setVal('edit-m-phone', user.phone || '');
    setVal('edit-m-pc', user.pc || '');
    setVal('edit-m-team', user.team);
    setVal('edit-m-game', user.game);
    setVal('edit-m-role', user.role);
    
    // Nếu là lyukikz gốc thì khóa không cho tự hạ quyền mình
    if (user.email.toLowerCase() === 'lyukikz@gmail.com') {
        document.getElementById('edit-m-role').disabled = true;
    } else {
        document.getElementById('edit-m-role').disabled = false;
    }

    const modal = document.getElementById('adminEditModal');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    modal.children[0].classList.remove('scale-95');
    modal.children[0].classList.add('scale-100');
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
