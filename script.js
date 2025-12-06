// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// URLs
const BACKEND_URL = "https://python22.pythonanywhere.com";
const CORS_PROXY = "https://corsproxy.io/?";

let isDownloading = false;

// Toast
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// Progress bar
function showProgress() {
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) {
            clearInterval(interval);
        } else {
            width += 2;
            progressBar.style.width = width + "%";
        }
    }, 50);
}

function hideProgress() {
    progressBar.style.width = "100%";
    setTimeout(() => progressContainer.style.display = "none", 500);
}

// Get proxy URL
function getProxyUrl(endpoint) {
    return `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + endpoint)}`;
}

// Test backend
async function testBackend() {
    try {
        const proxyUrl = getProxyUrl('/test');
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Backend test failed:", error);
        return false;
    }
}

// Validate URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Download video
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    
    // Validation
    if (!url) {
        showToast("Please enter a video URL", "error");
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast("Invalid URL format", "error");
        return;
    }
    
    // Check if it's a supported platform
    const urlLower = url.toLowerCase();
    const isSupported = urlLower.includes('youtube.com') || 
                       urlLower.includes('youtu.be') || 
                       urlLower.includes('tiktok.com') || 
                       urlLower.includes('instagram.com') || 
                       urlLower.includes('facebook.com');
    
    if (!isSupported) {
        showToast("Only YouTube, TikTok, Instagram, and Facebook are supported", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    input.style.border = "2px solid #4CAF50";
    
    showProgress();
    
    try {
        console.log("Starting download for:", url);
        
        const proxyUrl = getProxyUrl('/download');
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });
        
        hideProgress();
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Download response:", data);
        
        if (data.success) {
            showToast(`✅ ${data.platform || 'Video'} downloaded successfully!`, "success");
            
            // Show download info
            if (data.filename) {
                downloadMessage.textContent = data.title || "Video ready for download";
                downloadLink.href = `${BACKEND_URL}/get_file/${encodeURIComponent(data.filename)}`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('download', data.filename);
                downloadInfo.style.display = "block";
                
                input.value = "";
                input.placeholder = "Download ready! Paste another URL";
                
                // Auto reset after 15 seconds
                setTimeout(() => {
                    resetForm();
                }, 15000);
            }
            
        } else {
            showToast(data.error || "Download failed", "error");
            setTimeout(() => resetForm(), 3000);
        }
        
    } catch (error) {
        console.error("Download error:", error);
        hideProgress();
        
        let errorMessage = "Download failed. ";
        if (error.message.includes('429')) {
            errorMessage += "Too many requests. Try again later.";
        } else if (error.message.includes('404')) {
            errorMessage += "Video not found.";
        } else if (error.message.includes('403')) {
            errorMessage += "Access denied by the platform.";
        } else {
            errorMessage += error.message;
        }
        
        showToast(errorMessage, "error");
        setTimeout(() => resetForm(), 3000);
    } finally {
        isDownloading = false;
    }
}

function resetForm() {
    input.style.border = "2px solid #ddd";
    input.style.color = "#333";
    input.placeholder = "Paste TikTok, Instagram, YouTube, or Facebook URL here";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    downloadLink.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Started");
    console.log("📡 Backend:", BACKEND_URL);
    console.log("🔗 CORS Proxy:", CORS_PROXY);
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL and click Download";
        showToast("✅ Connected to server", "success");
        console.log("✅ System ready");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Offline';
        input.placeholder = "Server connection failed";
        showToast("❌ Server offline", "error");
        console.log("❌ Backend offline");
    }
    
    // Event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isDownloading && !button.disabled) {
            downloadVideo();
        }
    });
    
    // Real-time URL validation
    input.addEventListener("input", function() {
        const url = this.value.trim();
        
        if (!url) {
            this.style.border = "2px solid #ddd";
            this.style.color = "#333";
            return;
        }
        
        if (!isValidUrl(url)) {
            this.style.border = "2px solid #ff9800";
            this.style.color = "#ff9800";
            return;
        }
        
        const urlLower = url.toLowerCase();
        const isSupported = urlLower.includes('youtube.com') || 
                           urlLower.includes('youtu.be') || 
                           urlLower.includes('tiktok.com') || 
                           urlLower.includes('instagram.com') || 
                           urlLower.includes('facebook.com');
        
        if (isSupported) {
            this.style.border = "2px solid #4CAF50";
            this.style.color = "#4CAF50";
        } else {
            this.style.border = "2px solid #ff9800";
            this.style.color = "#ff9800";
        }
    });
});

// Manual test functions
window.testDownload = async function(testUrl) {
    if (testUrl) {
        input.value = testUrl;
    }
    await downloadVideo();
};

window.checkConnection = testBackend;
