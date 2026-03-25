// --- profile.js ---

// 1. CẬP NHẬT GIAO DIỆN THANH TIẾN ĐỘ
function updateProgressBar(idBar, idText, current, goal) {
    const bar = document.getElementById(idBar);
    const text = document.getElementById(idText);
    if (!bar || !text) return;

    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    bar.style.width = `${percentage}%`;
    text.innerText = current.toLocaleString(); // Hiển thị số có dấu phẩy cho dễ nhìn
}

// 2. LẤY DỮ LIỆU THỐNG KÊ (CHỈ CÒN KINAH)
async function fetchStats(userId) {
    try {
        // Giả sử lấy từ collection 'stats' hoặc 'users' trong Firebase
        // const docSnap = await getDoc(doc(db, "users", userId));
        // if (docSnap.exists()) {
        //     const data = docSnap.data();
        //     updateProgressBar('bar-kinah', 'prog-k-current', data.kinah || 0, data.kinahGoal || 1000);
        //     document.getElementById('prog-k-goal').innerText = data.kinahGoal || 1000;
        //     document.getElementById('p-fpe').innerText = data.fpe || 0;
        // }
        
        // Demo tạm thời để bạn thấy UI chạy:
        updateProgressBar('bar-kinah', 'prog-k-current', 450, 1000);
        document.getElementById('prog-k-goal').innerText = "1000";
    } catch (error) {
        console.error("Lỗi fetchStats:", error);
    }
}

// 3. CẬP NHẬT SẢN LƯỢNG (KINAH & ACC)
async function updateProduction() {
    const kinah = document.getElementById('input-kinah').value;
    const charCount = document.getElementById('input-char45').value;
    
    if (!kinah || !charCount) {
        alert("Vui lòng nhập đầy đủ Kinah và số Acc!");
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    try {
        // Logic lưu vào Firebase tại đây
        console.log(`Đang lưu cho ${user.uid}: Kinah=${kinah}, Chars=${charCount}`);
        alert("✅ Đã cập nhật sản lượng thành công!");
        
        // Reset input sau khi lưu
        document.getElementById('input-kinah').value = "";
        document.getElementById('input-char45').value = "";
        fetchStats(user.uid); // Load lại số liệu mới
    } catch (error) {
        alert("❌ Lỗi: " + error.message);
    }
}

// 4. HIỂN THỊ LINH THÚ (PETS)
async function renderProfile(userId) {
    const petList = document.getElementById('profile-pets-list');
    const slotText = document.getElementById('current-slots');
    if (!petList) return;

    // Giả sử lấy danh sách pet của user từ Firebase
    // const pets = user.pets || []; 
    const demoPets = [
        { id: 1, type: 'dragon', rarity: 'Rare' },
        { id: 2, type: 'slime', rarity: 'Common' }
    ];

    petList.innerHTML = demoPets.map(pet => `
        <div class="relative group bg-white dark:bg-gray-700 p-2 rounded-xl border dark:border-gray-600 shadow-sm">
            <img src="assets/pets/${pet.type}.png" class="w-full h-auto" alt="pet">
            <button onclick="releasePet('${pet.id}')" class="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    slotText.innerText = demoPets.length;
}

// 5. CÁC HÀM MODAL & PROFILE
function openEditModal() {
    document.getElementById('editModal').classList.add('modal-active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('modal-active');
}

async function handleUpdateProfile() {
    const phone = document.getElementById('edit-phone').value;
    const pc = document.getElementById('edit-pc').value;
    const avatar = document.getElementById('edit-avatar').value;

    // Logic cập nhật profile vào Firebase/LocalStorage
    // ...
    closeEditModal();
}

async function handleCheckIn() {
    const btn = document.getElementById('btn-checkin');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> ĐANG XỬ LÝ...';
    
    // Giả lập xử lý checkin
    setTimeout(() => {
        alert("🎉 Điểm danh thành công! +10 FPE");
        btn.innerHTML = '<i class="fas fa-check"></i> ĐÃ ĐIỂM DANH';
        btn.classList.replace('from-yellow-500', 'from-gray-400');
    }, 1500);
}

// --- KHỞI CHẠY HỆ THỐNG ---
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        window.location.assign('login.html');
        return;
    }

    // Đổ dữ liệu cơ bản từ LocalStorage lên UI trước
    document.getElementById('p-id').innerText = user.username || "NGƯỜI CHƠI";
    document.getElementById('p-team').innerText = user.team || "None";
    document.getElementById('p-game').innerText = user.game || "AION2";
    if (user.avatar) document.getElementById('p-avatar').src = user.avatar;
    
    // Hiển thị nút Admin nếu là admin
    if (user.role === 'admin') {
        document.getElementById('admin-panel-btn')?.classList.remove('hidden');
    }

    // Fetch dữ liệu thời gian thực
    fetchStats(user.uid);
    renderProfile(user.uid);
});

// Hàm DarkMode (Nếu core.js chưa có)
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}
