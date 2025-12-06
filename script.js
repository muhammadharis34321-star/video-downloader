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

// ✅ SIMPLE DOWNLOAD - GET METHOD SE (NO CORS ISSUE)
function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Paste YouTube URL first", "error");
        return;
    }
    
    console.log("Starting download for:", url);
    
    // ✅ METHOD 1: Direct download (YouTube/TikTok/Instagram/Facebook)
    let downloadUrl;
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        downloadUrl = `${BACKEND_URL}/download_direct?url=${encodeURIComponent(url)}`;
    } 
    else if (url.includes('tiktok.com')) {
        downloadUrl = `${BACKEND_URL}/download_direct?url=${encodeURIComponent(url)}`;
    }
    else if (url.includes('instagram.com')) {
        downloadUrl = `${BACKEND_URL}/download_direct?url=${encodeURIComponent(url)}`;
    }
    else if (url.includes('facebook.com') || url.includes('fb.watch')) {
        downloadUrl = `${BACKEND_URL}/download_direct?url=${encodeURIComponent(url)}`;
    }
    else {
        showToast("Invalid URL - Supported: YouTube, TikTok, Instagram, Facebook", "error");
        return;
    }
    
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
