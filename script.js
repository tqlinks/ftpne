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
