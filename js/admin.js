// Biến toàn cục lưu trữ danh sách nhân viên để tìm kiếm nhanh
let allUsers = [];

window.onload = () => {
    // 1. Kiểm tra quyền admin (Bảo mật cơ bản)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.assign('profile.html');
        return;
    }
    // 2. Tải dữ liệu lần đầu
    refreshAdminData();
};

// --- CHỨC NĂNG CHÍNH: LẤY DỮ LIỆU VÀ HIỂN THỊ ---
async function refreshAdminData() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        allUsers = await res.json();
        
        // Khởi tạo các biến tính tổng (Stats)
        let totalKinah = 0, totalOdy = 0, totalFpe = 0;
        
        tbody.innerHTML = allUsers.map(u => {
            // Cộng dồn thông số tổng
            totalKinah += Number(u.kinah || 0);
            totalOdy += Number(u.ody || 0);
            totalFpe += Number(u.fpe || 0);

            // Tính % tiến độ dựa trên mục tiêu (Kinah)
            const kPercent = u.kGoal > 0 ? Math.min(100, Math.round((u.kinah / u.kGoal) * 100)) : 0;
            // Đếm số linh thú đang sở hữu
            const petCount = u.pets ? String(u.pets).split(',').filter(id => id !== "").length : 0;

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition border-b dark:border-gray-800">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${u.avatar || 'https://i.pravatar.cc/100'}" class="w-10 h-10 rounded-full border dark:border-gray-700 object-cover shadow-sm">
                        <div>
                            <p class="font-black text-indigo-600 dark:text-indigo-400">${u.id}</p>
                            <p class="text-[10px] font-bold text-gray-400 italic">Máy: ${u.pc || '---'}</p>
                        </div>
                    </div>
                </td>
                
                <td class="p-4 font-bold">
                    <div class="text-purple-600 dark:text-purple-400">${u.kinah || 0}M Kinah</div>
                    <div class="text-orange-500 text-xs">${u.ody || 0} Ody</div>
                </td>
                
                <td class="p-4">
                    <div class="w-32">
                        <div class="flex justify-between text-[10px] mb-1 font-black">
                            <span>${kPercent}%</span>
                            <span class="text-gray-400">Target: ${u.kGoal}M</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-indigo-500 h-full transition-all duration-500" style="width: ${kPercent}%"></div>
                        </div>
                    </div>
                </td>
                
                <td class="p-4 text-center">
                    <div class="text-yellow-500 font-black">${u.fpe || 0} <i class="fas fa-coins text-[10px]"></i></div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">${petCount}/10 PETS</div>
                </td>
                
                <td class="p-4 text-center">
                    ${u.image ? 
                        `<button onclick="viewImage('${u.image}')" class="text-indigo-500 hover:text-white hover:bg-indigo-500 p-2 rounded-lg transition border border-indigo-500/20 shadow-sm">
                            <i class="fas fa-image"></i>
                        </button>` : 
                        `<span class="text-gray-400 text-[10px] italic">No Image</span>`
                    }
                </td>
                
                <td class="p-4 text-center">
                    <button onclick="openEditUser('${u.id}')" class="text-gray-400 hover:text-indigo-500 p-2 transition">
                        <i class="fas fa-user-edit"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');

        // Cập nhật số liệu thống kê lên các thẻ Header
        if(document.getElementById('stat-total-users')) document.getElementById('stat-total-users').innerText = allUsers.length;
        if(document.getElementById('stat-total-kinah')) document.getElementById('stat-total-kinah').innerText = totalKinah.toLocaleString() + 'M';
        if(document.getElementById('stat-total-ody')) document.getElementById('stat-total-ody').innerText = totalOdy.toLocaleString();
        if(document.getElementById('stat-total-fpe')) document.getElementById('stat-total-fpe').innerText = totalFpe.toLocaleString();

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-red-500 font-bold">Lỗi kết nối Server!</td></tr>`;
    }
}

// --- CHỨC NĂNG XỬ LÝ MODAL CHỈNH SỬA ---

function openEditUser(userId) {
    // Tìm thông tin nhân viên trong mảng đã tải về
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    // Đổ dữ liệu vào các ô input trong Modal
    document.getElementById('old-id').value = user.id; // Lưu ID cũ làm mốc tìm kiếm
    document.getElementById('edit-id').value = user.id;
    document.getElementById('edit-pc').value = user.pc || '';
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-email').value = user.email || '';

    // Hiển thị Modal
    const modal = document.getElementById('editUserModal');
    modal.classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editUserModal').classList.add('hidden');
}

async function saveUserInfo() {
    const btn = document.getElementById('btn-save-user');
    const oldId = document.getElementById('old-id').value;
    
    // Thu thập dữ liệu mới
    const payload = {
        action: "admin_update_user",
        oldId: oldId,
        newId: document.getElementById('edit-id').value,
        pc: document.getElementById('edit-pc').value,
        phone: document.getElementById('edit-phone').value,
        email: document.getElementById('edit-email').value
    };

    // Vô hiệu hóa nút để tránh bấm nhiều lần
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> ĐANG LƯU...';

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Dùng no-cors cho Apps Script
            body: JSON.stringify(payload)
        });
        
        // Vì dùng no-cors nên không nhận được JSON trả về, giả định thành công
        alert("✅ Đã cập nhật thông tin nhân viên!");
        closeEditModal();
        refreshAdminData(); // Tải lại bảng để cập nhật thông tin mới
    } catch (e) {
        alert("❌ Lỗi: Không thể lưu dữ liệu.");
        btn.disabled = false;
        btn.innerText = "LƯU THAY ĐỔI";
    }
}

// --- XỬ LÝ XEM ẢNH ---
function viewImage(imgUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modal-img-view');
    if (modal && modalImg) {
        modalImg.src = imgUrl;
        modal.classList.remove('hidden');
    }
}
