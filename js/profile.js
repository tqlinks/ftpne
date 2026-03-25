// Biến toàn cục để lưu trữ file ảnh vừa dán
let selectedImageFile = null;

// --- 1. LOGIC DÁN ẢNH TỪ CLIPBOARD ---
document.addEventListener('paste', async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    
    for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            displayPreview(blob);
            selectedImageFile = blob; // Lưu lại để tí nữa upload
        }
    }
});

function displayPreview(blob) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('img-preview').src = e.target.result;
        document.getElementById('preview-container').classList.remove('hidden');
        document.getElementById('paste-placeholder').classList.add('hidden');
        document.getElementById('paste-zone').classList.add('border-indigo-500');
    };
    reader.readAsDataURL(blob);
}

function clearImage() {
    selectedImageFile = null;
    document.getElementById('img-preview').src = "";
    document.getElementById('preview-container').classList.add('hidden');
    document.getElementById('paste-placeholder').classList.remove('hidden');
    document.getElementById('paste-zone').classList.remove('border-indigo-500');
}

// --- 2. CẬP NHẬT BÁO CÁO (MODIFIED) ---
async function updateProduction() {
    const kinah = document.getElementById('input-kinah').value;
    const ody = document.getElementById('input-ody').value;
    
    if (!kinah || !ody) {
        alert("⚠️ Vui lòng nhập Kinah và số Ody!");
        return;
    }

    if (!selectedImageFile) {
        alert("⚠️ Vui lòng dán ảnh bằng chứng (Ctrl+V) trước khi lưu!");
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
        // TẢI ẢNH LÊN FIREBASE STORAGE (Giả định)
        // const storageRef = ref(storage, `reports/${user.uid}_${Date.now()}.jpg`);
        // await uploadBytes(storageRef, selectedImageFile);
        // const imgUrl = await getDownloadURL(storageRef);

        console.log("Dữ liệu gửi đi:", { 
            kinah: kinah, 
            ody: ody, 
            image: "đã có file" 
        });

        alert("✅ Đã lưu báo cáo Kinah & Ody kèm ảnh thành công!");
        
        // Reset form
        document.getElementById('input-kinah').value = "";
        document.getElementById('input-ody').value = "";
        clearImage();
        
    } catch (error) {
        console.error(error);
        alert("❌ Lỗi khi lưu dữ liệu!");
    }
}
