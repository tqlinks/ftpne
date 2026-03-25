// Thêm vào đầu file profile.js
let reportHistory = JSON.parse(localStorage.getItem('user_reports')) || [];

// --- 1. HÀM HIỂN THỊ LỊCH SỬ ---
function renderReportHistory() {
    const historyList = document.getElementById('report-history-list');
    if (!historyList) return;

    if (reportHistory.length === 0) {
        historyList.innerHTML = `<p class="text-center text-xs text-gray-400 py-4 italic">Chưa có dữ liệu báo cáo...</p>`;
        return;
    }

    historyList.innerHTML = reportHistory.map((report, index) => `
        <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-3 shadow-sm flex gap-3 items-center">
            <div class="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden border dark:border-gray-600">
                <img src="${report.image}" class="w-full h-full object-cover cursor-pointer" onclick="window.open('${report.image}')">
            </div>
            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <span class="text-[9px] font-bold text-gray-400 uppercase">${report.time}</span>
                    <span class="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-bold">Thành công</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-1">
                    <p class="text-xs font-black text-purple-600">Kina: <span class="text-gray-700 dark:text-gray-200">${report.kinah}M</span></p>
                    <p class="text-xs font-black text-orange-600">Ody: <span class="text-gray-700 dark:text-gray-200">${report.ody}</span></p>
                </div>
            </div>
        </div>
    `).reverse().join(''); // .reverse() để cái mới nhất lên đầu
}

// --- 2. CẬP NHẬT HÀM updateProduction ---
async function updateProduction() {
    const kinah = document.getElementById('input-kinah').value;
    const ody = document.getElementById('input-ody').value;
    const previewImg = document.getElementById('img-preview').src;
    
    if (!kinah || !ody || !selectedImageFile) {
        alert("⚠️ Vui lòng nhập đủ Kina, Ody và dán ảnh bằng chứng!");
        return;
    }

    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}`;

    const newReport = {
        kinah: kinah,
        ody: ody,
        image: previewImg, // Trong thực tế Linh nên upload lên Firebase rồi lấy URL
        time: timeString
    };

    try {
        // 1. Thêm vào mảng lịch sử
        reportHistory.push(newReport);
        
        // 2. Lưu vào LocalStorage (hoặc Firebase Firestore)
        localStorage.setItem('user_reports', JSON.stringify(reportHistory));

        // 3. Cập nhật UI
        renderReportHistory();
        alert("✅ Báo cáo của bạn đã được lưu vào lịch sử!");

        // Reset form
        document.getElementById('input-kinah').value = "";
        document.getElementById('input-ody').value = "";
        clearImage();

    } catch (error) {
        alert("❌ Lỗi lưu báo cáo!");
    }
}

// --- 3. KHỞI CHẠY ---
document.addEventListener('DOMContentLoaded', () => {
    // ... các code cũ ...
    renderReportHistory(); // Hiển thị lịch sử ngay khi load trang
});
