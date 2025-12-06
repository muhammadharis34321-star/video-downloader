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
const CORS_PROXY = "https://corsproxy.io/?";

let isDownloading = false;

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
    progressBar.style.width = "100%";
    setTimeout(() => progressContainer.style.display = "none", 500);
}

// ✅ SIMPLE BACKEND TEST - SIRF PROXY SE
async function testBackend() {
    try {
        console.log("🔄 Testing via proxy...");
        
        // ✅ SIRF PROXY USE KARO
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/test')}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Connected via proxy:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Connection error:", error);
        return false;
    }
}

// URL validation
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Detect platform
function detectPlatform(url) {
    url = url.toLowerCase();
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    return 'Unknown';
}

// ✅ SIMPLE DOWNLOAD FUNCTION - SIRF PROXY SE
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    
    if (!url) {
        showToast("Paste video URL first", "error");
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast("Invalid URL format", "error");
        return;
    }
    
    const platform = detectPlatform(url);
    if (platform === 'Unknown') {
        showToast("Supported: YouTube, TikTok, Instagram, Facebook", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Downloading...`;
    showProgress(30);
    
    try {
        console.log(`🎬 Downloading ${platform} video...`);
        
        // ✅ HAMESHA PROXY USE KARO
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/download')}`;
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url })
        });
        
        showProgress(70);
        
        const data = await response.json();
        console.log("Response:", data);
        
        if (data.success) {
            showProgress(100);
            
            setTimeout(() => {
                hideProgress();
                showToast(`✅ ${platform} video ready!`, "success");
                
                // Show download info
                if (data.title) {
                    downloadMessage.textContent = `"${data.title}" ready to download`;
                }
                
                // Set download link
                if (data.filename) {
                    const downloadUrl = `${BACKEND_URL}/get_file/${data.filename}`;
                    downloadLink.href = downloadUrl;
                    downloadLink.download = `${data.title || 'video'}.mp4`;
                    downloadLink.style.display = "inline-block";
                    downloadInfo.style.display = "block";
                    console.log("📥 Download URL:", downloadUrl);
                }
                
                input.value = "";
                input.placeholder = "Paste another URL";
                
            }, 1000);
            
        } else {
            throw new Error(data.error || "Download failed");
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        hideProgress();
        showToast(`Error: ${error.message}`, "error");
        
    } finally {
        setTimeout(() => {
            isDownloading = false;
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        }, 2000);
    }
}

// Reset form
function resetForm() {
    input.value = "";
    input.style.border = "2px solid #ddd";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Input validation
input.addEventListener("input", function() {
    const url = this.value.trim();
    
    if (!url) {
        this.style.border = "2px solid #ddd";
        return;
    }
    
    if (!isValidUrl(url)) {
        this.style.border = "2px solid #ff9800";
        return;
    }
    
    const platform = detectPlatform(url);
    if (platform !== 'Unknown') {
        this.style.border = "2px solid #4CAF50";
    } else {
        this.style.border = "2px solid #f44336";
    }
});

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Starting...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL and click Download";
        showToast("✅ Connected to server", "success");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        input.placeholder = "Server connection failed";
        showToast("❌ Server offline", "error");
    }
    
    // Event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isDownloading && !button.disabled) {
            downloadVideo();
        }
    });
});
