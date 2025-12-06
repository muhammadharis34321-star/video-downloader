// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ BACKEND URL - DIRECT USE KARO
const BACKEND_URL = "https://python22.pythonanywhere.com";

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

// ✅ Test backend - DIRECT CALL
async function testBackend() {
    try {
        console.log("🔗 Testing direct connection...");
        
        const response = await fetch(`${BACKEND_URL}/test`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Direct connection:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Connection failed:", error);
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

// ✅ SIMPLE DOWNLOAD FUNCTION - DIRECT FETCH
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
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    showProgress(30);
    
    try {
        console.log(`🎬 Starting download for: ${url}`);
        
        // ✅ DIRECT FETCH WITHOUT PROXY
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ url: url })
        });
        
        showProgress(70);
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Non-JSON response:", text.substring(0, 200));
            throw new Error("Server returned non-JSON response");
        }
        
        const data = await response.json();
        console.log("✅ Server response:", data);
        
        if (data.success) {
            showProgress(100);
            
            setTimeout(() => {
                hideProgress();
                showToast(`✅ ${platform} video ready!`, "success");
                
                // Show download info
                downloadMessage.textContent = `"${data.title || 'Video'}" ready to download`;
                
                // Set download link
                if (data.filename) {
                    const downloadUrl = `${BACKEND_URL}/get_file/${data.filename}`;
                    downloadLink.href = downloadUrl;
                    downloadLink.download = `${data.title || 'video'}.mp4`;
                    downloadLink.style.display = "inline-block";
                    downloadInfo.style.display = "block";
                    
                    // Auto click after 2 seconds
                    setTimeout(() => {
                        downloadLink.click();
                    }, 2000);
                }
                
                // Reset input
                input.value = "";
                input.placeholder = "Paste another URL";
                
            }, 1000);
            
        } else {
            throw new Error(data.error || "Download failed");
        }
        
    } catch (error) {
        console.error("❌ Download error:", error);
        hideProgress();
        showToast(`Error: ${error.message}`, "error");
        
        // Alternative method try karo
        setTimeout(() => {
            showToast("Trying alternative method...", "info");
            
            // Open backend in new tab
            const backendUrl = `${BACKEND_URL}/download_manual?url=${encodeURIComponent(input.value)}`;
            window.open(backendUrl, '_blank');
        }, 2000);
        
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
        input.placeholder = "Paste YouTube/TikTok/Instagram/Facebook URL";
        showToast("✅ Connected to server", "success");
        
        // Auto-test with sample URL
        setTimeout(() => {
            if (input.value === "") {
                input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                input.style.border = "2px solid #4CAF50";
                showToast("Sample URL loaded - Click Download to test", "info");
            }
        }, 1000);
        
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

// Quick test function
window.quickTest = function() {
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    downloadVideo();
};

// Manual download function
window.manualDownload = function() {
    const url = input.value.trim();
    if (url) {
        window.open(`${BACKEND_URL}/download?url=${encodeURIComponent(url)}`, '_blank');
    }
};
