// --- shop.js ---

const eleColors = {
    "Hỏa": "bg-red-500", "Thủy": "bg-blue-500", "Phong": "bg-teal-400", 
    "Thổ": "bg-amber-700", "Lôi": "bg-purple-500", "Ám": "bg-gray-800 text-white",
    "Quang": "bg-yellow-400 text-yellow-900", "Băng": "bg-cyan-400", "Mộc": "bg-green-500",
    "Kim": "bg-slate-400", "Độc": "bg-lime-500", "Không Gian": "bg-black text-purple-400 border border-purple-500"
};

let currentSelectedPet = null;
let currentFilter = 'All';

function isInventoryFull() {
    const user = JSON.parse(localStorage.getItem('user'));
    const ownedPets = user && user.pets ? String(user.pets).split(',').filter(id => id !== "") : [];
    return ownedPets.length >= 10;
}

function renderShop(filterElement = 'All') {
    // (Copy toàn bộ ruột hàm renderShop cũ của bạn vào đây)
    // ...
}

function openPetDetails(id) {
    // (Copy toàn bộ ruột hàm openPetDetails cũ của bạn vào đây)
    // ...
}

function closePetModal() {
    // (Copy toàn bộ ruột hàm closePetModal cũ của bạn vào đây)
    // ...
}

async function buyCurrentPet() {
    if (!currentSelectedPet) return;
    if (isInventoryFull()) return alert("⚠️ Túi đồ đã đầy (10/10)! Bạn cần giải phóng linh thú cũ để mua thêm.");
    // (Copy phần fetch mua hàng cũ vào đây)
    // ...
}

async function handleGacha() {
    if (isInventoryFull()) return alert("⚠️ Túi đồ đã đầy (10/10)! Không thể chứa thêm linh thú mới từ trứng.");
    // (Copy logic quay gacha và fetch vào đây)
    // ...
}

function showGachaResult(pet, tier) {
    // (Copy ruột hàm showGachaResult)
    // ...
}

// --- KHỞI CHẠY SHOP ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pet-grid')) renderShop();
});
