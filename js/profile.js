// --- KHỞI TẠO BIẾN TOÀN CỤC ---
let currentUser = JSON.parse(localStorage.getItem('user'));
let capturedImage = null;

window.onload = async () => {
    if (!currentUser) {
        window.location.assign('login.html');
        return;
    }

    // 1. Hiển thị thông tin
    renderUserInfo();
    renderPetInventory();
    initPetToggleState();

    // 2. Khởi tạo Clipboard
    initClipboardPaste();
    
    // 3. Kiểm tra Điểm danh
    checkDailyStatus();
};

// 1. HIỂN THỊ DỮ LIỆU
function renderUserInfo() {
    const u = currentUser;
    setText('p-id', u.id);
    setText('p-team', u.team || "---");
    setText('p-game', u.game || "---");
    setText('p-fpe', u.fpe || 0);
    
    if (u.avatar) document.getElementById('p-avatar').src = u.avatar;

    // Cập nhật progress bar Kinah
    updateProgress('kinah', u.kinah, u.kGoal);
    setVal('input-kinah', u.kinah || 0);
    setVal('input-ody', u.ody || 0);
    
    // Hiện nút Admin
    if (u.role === 'admin' || (u.email && u.email.toLowerCase() === 'lyukikz@gmail.com')) {
        const adminBtn = document.getElementById('admin-panel-btn');
        if (adminBtn) adminBtn.classList.remove('hidden');
    }
}

// 2. TÚI LINH THÚ & THU NHỎ
function renderPetInventory() {
    const list = document.getElementById('profile-pets-list');
    const slots = document.getElementById('current-slots');
    if (!list) return;

    const ownedIds = currentUser.pets ? String(currentUser.pets).split(',').filter(id => id !== "") : [];
    if (slots) slots.innerText = ownedIds.length;

    if (ownedIds.length === 0) {
        list.innerHTML = `<p class="col-span-full text-[10px] text-gray-400 text-center py-4 italic">Chưa có linh thú</p>`;
        return;
    }

    list.innerHTML = ownedIds.map(id => {
        const pet = PET_DATABASE.find(p => p.id === id);
        if (!pet) return "";
        return `<div class="bg-white dark:bg-gray-700 p-1 rounded-lg shadow-sm border dark:border-gray-600 text-center">
                    <img src="${pet.img}" class="w-8 h-8 mx-auto object-contain">
                    <p class="text-[7px] font-bold mt-1 truncate">${pet.name}</p>
                </div>`;
    }).join('');
}

function togglePetInventory() {
    const content = document.getElementById('pet-inventory-content');
    const btn = document.getElementById('pet-toggle-btn');
    const isHidden = content.classList.contains('max-h-0');

    if (isHidden) {
        content.classList.remove('max-h-0', 'opacity-0');
        content.classList.add('max-h-[500px]', 'opacity-100');
        btn.style.transform = 'rotate(0deg)';
        localStorage.setItem('pet_collapsed', 'false');
    } else {
        content.classList.add('max-h-0', 'opacity-0');
        content.classList.remove('max-h-[500px]', 'opacity-100');
        btn.style.transform = 'rotate(180deg)';
        localStorage.setItem('pet_collapsed', 'true');
    }
}

function initPetToggleState() {
    if (localStorage.getItem('pet_collapsed') === 'true') {
        const content = document.getElementById('pet-inventory-content');
        const btn = document.getElementById('pet-toggle-btn');
        content.classList.add('max-h-0', 'opacity-0');
        content.classList.remove('max-h-[500px]', 'opacity-100');
        btn.style.transform = 'rotate(180deg)';
    }
}

// 3. XỬ LÝ CLIPBOARD (DÁN ẢNH)
function initClipboardPaste() {
    const zone = document.getElementById('paste-zone');
    if (!zone) return;

    zone.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    capturedImage = event.target.result;
                    document.getElementById('img-preview').src = capturedImage;
                    document.getElementById('preview-container').classList.remove('hidden');
                    document.getElementById('paste-placeholder').classList.add('hidden');
                };
                reader.readAsDataURL(blob);
            }
        }
    });
}

function clearImage(e) {
    if(e) e.stopPropagation();
    capturedImage = null;
    document.getElementById('preview-container').classList.add('hidden');
    document.getElementById('paste-placeholder').classList.remove('hidden');
}

// 4. CẬP NHẬT BÁO CÁO
async function updateProduction() {
    const kinah = document.getElementById('input-kinah').value;
    const ody = document.getElementById('input-ody').value;
    const btn = document.querySelector('button[onclick="updateProduction()"]');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG GỬI...';

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            body: JSON.stringify({ 
                action: "update_prod", id: currentUser.id, 
                kinah: kinah, ody: ody, image: capturedImage 
            })
        });
        
        currentUser.kinah = kinah;
        currentUser.ody = ody;
        localStorage.setItem('user', JSON.stringify(currentUser));
        alert("✅ Báo cáo thành công!");
        window.location.reload();
    } catch (e) {
        alert("Lỗi kết nối!");
        btn.disabled = false;
        btn.innerText = "LƯU BÁO CÁO & ẢNH";
    }
}

// 5. ĐIỂM DANH
async function handleCheckIn() {
    const today = new Date().toLocaleDateString('vi-VN');
    const btn = document.getElementById('btn-checkin');
    
    btn.disabled = true;
    btn.innerText = "...";

    try {
        await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST', mode: 'no-cors',
            body: JSON.stringify({ action: "check_in", id: currentUser.id, todayDate: today })
        });
        
        currentUser.fpe = (Number(currentUser.fpe) || 0) + 5;
        currentUser.lastCheckIn = today;
        localStorage.setItem('user', JSON.stringify(currentUser));
        alert("🎉 +5 FPE thành công!");
        window.location.reload();
    } catch (e) {
        btn.disabled = false;
    }
}

function checkDailyStatus() {
    const today = new Date().toLocaleDateString('vi-VN');
    const btn = document.getElementById('btn-checkin');
    if (btn && currentUser.lastCheckIn === today) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> ĐÃ NHẬN';
        btn.className = "bg-gray-300 dark:bg-gray-700 text-gray-500 px-5 py-2.5 rounded-xl font-black cursor-not-allowed flex items-center gap-2";
    }
}

// HÀM HỖ TRỢ
function updateProgress(type, current, goal) {
    const bar = document.getElementById(`bar-${type}`);
    const currTxt = document.getElementById(`prog-${type}-current`);
    const goalTxt = document.getElementById(`prog-${type}-goal`);
    const c = Number(current) || 0;
    const g = Number(goal) || 0;
    const percent = g > 0 ? Math.min(100, Math.round((c / g) * 100)) : 0;
    if (bar) bar.style.width = percent + '%';
    if (currTxt) currTxt.innerText = c;
    if (goalTxt) goalTxt.innerText = g;
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.innerText = val; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function logout() { localStorage.removeItem('user'); window.location.assign('login.html'); }
function toggleDarkMode() { document.documentElement.classList.toggle('dark'); }
function openEditModal() { document.getElementById('editModal').classList.add('modal-active'); }
function closeEditModal() { document.getElementById('editModal').classList.remove('modal-active'); }
