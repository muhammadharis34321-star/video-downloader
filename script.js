// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");

// ✅ TUMHARA APNA BACKEND
const BACKEND_URL = "https://python22.pythonanywhere.com";

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast " + type + " show";
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// ✅ APNA BACKEND USE KARNE KA FUNCTION
function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("URL paste karo", "error");
        return;
    }
    
    // Validate
    try {
        new URL(url);
    } catch {
        showToast("Invalid URL", "error");
        return;
    }
    
    // Check platform
    const urlLower = url.toLowerCase();
    const supported = urlLower.includes('youtube.com') || 
                     urlLower.includes('youtu.be') ||
                     urlLower.includes('tiktok.com') ||
                     urlLower.includes('instagram.com') ||
                     urlLower.includes('facebook.com');
    
    if (!supported) {
        showToast("YouTube, TikTok, Instagram, Facebook", "error");
        return;
    }
    
    console.log("Downloading:", url);
    
    // ✅ APNA BACKEND URL
    const downloadUrl = `${BACKEND_URL}/download?url=${encodeURIComponent(url)}`;
    
    // Open in new tab
    window.open(downloadUrl, '_blank');
    
    showToast("✅ Download start ho gaya!", "success");
    
    // Clear input
    setTimeout(() => {
        input.value = "";
    }, 1000);
}

// Initialize
window.addEventListener("load", () => {
    console.log("Video Downloader Started");
    
    // Test URL auto-load
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    showToast("✅ Ready! Download karo", "success");
    
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") downloadVideo();
    });
});

// Test function
window.testBackend = function() {
    // Test all endpoints
    const tests = [
        `${BACKEND_URL}/`,
        `${BACKEND_URL}/test`,
        `${BACKEND_URL}/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`
    ];
    
    tests.forEach(url => {
        console.log("Testing:", url);
        window.open(url, '_blank');
    });
};
