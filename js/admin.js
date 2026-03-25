// js/admin.js

window.onload = () => {
    // Kiểm tra quyền admin trước khi cho xem
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.assign('profile.html');
        return;
    }
    refreshAdminData();
};

async function refreshAdminData() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const res = await fetch(`${CONFIG.SCRIPT_URL}?action=get_admin`);
        const users = await res.json();
        
        // 1. Tính toán Thống kê tổng
        let totalKinah = 0, totalOdy = 0, totalFpe = 0;
        
        tbody.innerHTML = users.map(u => {
            totalKinah += Number(u.kinah || 0);
            totalOdy += Number(u.ody || 0);
            totalFpe += Number(u.fpe || 0);

            // Tính % tiến độ Kinah
            const kPercent = u.kGoal > 0 ? Math.min(100, Math.round((u.kinah / u.kGoal) * 100)) : 0;
            const petCount = u.pets ? String(u.pets).split(',').filter(id => id !== "").length : 0;

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${u.avatar || 'https://i.pravatar.cc/100'}" class="w-10 h-10 rounded-full border dark:border-gray-700 object-cover">
                        <div>
                            <p class="font-black text-indigo-600 dark:text-indigo-400">${u.id}</p>
                            <p class="text-[10px] font-bold text-gray-400 italic">Máy: ${u.pc || '---'}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4 font-bold">
                    <div class="text-purple-600">${u.kinah || 0}M Kinah</div>
                    <div class="text-orange-500 text-xs">${u.ody || 0} Ody</div>
                </td>
                <td class="p-4">
                    <div class="w-32">
                        <div class="flex justify-between text-[10px] mb-1 font-black">
                            <span>${kPercent}%</span>
                            <span class="text-gray-400">Target: ${u.kGoal}M</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-indigo-500 h-full" style="width: ${kPercent}%"></div>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-center">
                    <div class="text-yellow-500 font-black">${u.fpe || 0} <i class="fas fa-coins text-[10px]"></i></div>
                    <div class="text-[10px] text-gray-400 font-bold">${petCount}/10 PETS</div>
                </td>
                <td class="p-4 text-center">
                    ${u.image ? 
                        `<button onclick="viewImage('${u.image}')" class="text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 p-2 rounded-lg transition">
                            <i class="fas fa-image"></i> Xem Ảnh
                        </button>` : 
                        `<span class="text-gray-500 text-[10px] italic">Chưa dán ảnh</span>`
                    }
                </td>
                <td class="p-4 text-center">
                    <button onclick="alert('Tính năng chỉnh sửa mục tiêu đang cập nhật...')" class="text-gray-400 hover:text-white transition">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');

        // Cập nhật số liệu Header
        document.getElementById('stat-total-users').innerText = users.length;
        document.getElementById('stat-total-kinah').innerText = totalKinah.toLocaleString() + 'M';
        document.getElementById('stat-total-ody').innerText = totalOdy.toLocaleString();
        document.getElementById('stat-total-fpe').innerText = totalFpe.toLocaleString();

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-red-500">Lỗi tải dữ liệu từ Apps Script!</td></tr>`;
    }
}

function viewImage(imgUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modal-img-view');
    modalImg.src = imgUrl;
    modal.classList.remove('hidden');
}
