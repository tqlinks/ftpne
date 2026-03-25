// Biến tạm lưu danh sách để tìm kiếm nhanh
let allUsers = [];

async function refreshAdminData() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        allUsers = await res.json();
        
        tbody.innerHTML = allUsers.map(u => {
            // ... (Giữ nguyên phần render các cột như cũ) ...
            // Chỉ cần cập nhật nút Thao tác ở cột cuối:
            return `
            <tr class="...">
                <td class="p-4 text-center">
                    <button onclick="openEditUser('${u.id}')" class="text-indigo-500 hover:bg-indigo-500/10 p-2 rounded-lg transition">
                        <i class="fas fa-user-edit"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) { console.error(e); }
}

// Mở Modal và nạp dữ liệu hiện tại
function openEditUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('old-id').value = user.id;
    document.getElementById('edit-id').value = user.id;
    document.getElementById('edit-pc').value = user.pc || '';
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-email').value = user.email || '';

    document.getElementById('editUserModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editUserModal').classList.add('hidden');
}

// Gửi lệnh cập nhật lên Apps Script
async function saveUserInfo() {
    const btn = document.getElementById('btn-save-user');
    const payload = {
        action: "admin_update_user",
        oldId: document.getElementById('old-id').value,
        newId: document.getElementById('edit-id').value,
        pc: document.getElementById('edit-pc').value,
        phone: document.getElementById('edit-phone').value,
        email: document.getElementById('edit-email').value
    };

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        alert("✅ Đã cập nhật thông tin thành công!");
        closeEditModal();
        refreshAdminData(); // Tải lại bảng
    } catch (e) {
        alert("Lỗi kết nối!");
    } finally {
        btn.disabled = false;
        btn.innerText = "LƯU THAY ĐỔI";
    }
}
