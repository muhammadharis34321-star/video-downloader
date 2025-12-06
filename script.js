// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ BACKEND URL
const BACKEND_URL = "https://python22.pythonanywhere.com";

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast " + type + " show";
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// Progress bar
function showProgress(p) {
    progressContainer.style.display = "block";
    progressBar.style.width = p + "%";
}

function hideProgress() {
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
}

// ✅ WORKING DOWNLOAD FUNCTION
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
    
    // Show progress
    showProgress(30);
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    
    // ✅ DIRECT DOWNLOAD LINK
    const downloadUrl = `${BACKEND_URL}/download?url=${encodeURIComponent(url)}`;
    
    console.log("Opening:", downloadUrl);
    
    // Open in new tab
    const newTab = window.open(downloadUrl, '_blank');
    
    // Update progress
    showProgress(70);
    showToast("✅ Download started in new tab!", "success");
    
    // Complete progress
    setTimeout(() => {
        showProgress(100);
        setTimeout(() => {
            hideProgress();
            
            // Show download info
            downloadMessage.textContent = "Download should start automatically. If not, check the new tab.";
            downloadLink.href = downloadUrl;
            downloadLink.textContent = "Click here if download doesn't start";
            downloadLink.target = "_blank";
            downloadInfo.style.display = "block";
            
            // Reset button
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            
            // Reset input
            setTimeout(() => {
                input.value = "";
                input.placeholder = "Paste another URL";
            }, 2000);
            
        }, 1000);
    }, 2000);
}

// Initialize
window.addEventListener("load", () => {
    console.log("🚀 Video Downloader Started");
    
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
