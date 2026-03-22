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
async function fetchManageData() {
    const tbody = document.getElementById('manage-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        globalUsersList = await res.json();
        
        tbody.innerHTML = globalUsersList.map(u => {
            const avatarImg = u.avatar || 'https://i.pravatar.cc/150?u=' + u.id;
            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition dark:text-gray-300 border-b dark:border-gray-700">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${avatarImg}" class="w-10 h-10 rounded-full border shadow-sm object-cover">
                        <div>
                            <p class="font-black">${u.id}</p>
                            <p class="text-[10px] text-gray-500">${u.email}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-xs">
                    <i class="fas fa-desktop text-indigo-500"></i> <b>${u.pc || '---'}</b><br>
                    <i class="fas fa-users text-gray-400"></i> ${u.team}
                </td>
                <td class="p-4 text-center">
                    <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                        ${u.char45 || 0} Lv45
                    </span>
                </td>
                <td class="p-4 text-center">
                    <button onclick="openAdminEditModal('${u.id}')" class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center">Lỗi tải dữ liệu</td></tr>`;
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
