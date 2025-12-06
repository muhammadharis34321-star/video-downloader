// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");

// ✅ BACKEND URL
const BACKEND_URL = "https://python22.pythonanywhere.com";

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast " + type + " show";
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// ✅ SIMPLE DOWNLOAD - ALWAYS WORKS
function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Paste YouTube URL first", "error");
        return;
    }
    
    console.log("Starting download for:", url);
    
    // ✅ ALWAYS USE GET METHOD - NO CORS ISSUES
    const downloadUrl = `${BACKEND_URL}/download_direct?url=${encodeURIComponent(url)}`;
    
    // Open in new tab
    window.open(downloadUrl, '_blank');
    
    showToast("✅ Download started in new tab!", "success");
    
    // Reset input
    input.value = "";
    input.placeholder = "Paste another URL";
}

// Initialize
window.addEventListener("load", () => {
    console.log("🚀 Video Downloader Ready!");
    
    // Auto-load test URL
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    showToast("✅ Ready! Click Download to start", "success");
    
    // Event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            downloadVideo();
        }
    });
});

// Quick test
window.quickTest = function() {
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    downloadVideo();
};
