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

// ✅ SIMPLE DOWNLOAD FUNCTION
function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste a video URL", "error");
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch {
        showToast("Invalid URL format", "error");
        return;
    }
    
    // Check supported platforms
    const urlLower = url.toLowerCase();
    const isSupported = urlLower.includes('youtube.com') || 
                       urlLower.includes('youtu.be') ||
                       urlLower.includes('tiktok.com') ||
                       urlLower.includes('instagram.com') ||
                       urlLower.includes('facebook.com') ||
                       urlLower.includes('fb.watch');
    
    if (!isSupported) {
        showToast("Supported: YouTube, TikTok, Instagram, Facebook", "error");
        return;
    }
    
    console.log("Starting download for:", url);
    
    // ✅ DIRECT DOWNLOAD LINK
    const downloadUrl = `${BACKEND_URL}/download?url=${encodeURIComponent(url)}`;
    
    // Open in new tab
    window.open(downloadUrl, '_blank');
    
    showToast("✅ Download started in new tab!", "success");
    
    // Reset input after 2 seconds
    setTimeout(() => {
        input.value = "";
        input.placeholder = "Paste another URL";
    }, 2000);
}

// Initialize
window.addEventListener("load", () => {
    console.log("🚀 Video Downloader Started");
    
    // Auto-load test URL
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    showToast("✅ Ready! Paste URL and click Download", "success");
    
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
