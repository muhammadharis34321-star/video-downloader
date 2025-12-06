// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Use CORS Proxy - Yeh 100% kaam karega
const BACKEND_URL = "https://python22.pythonanywhere.com";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
// Alternative: "https://corsproxy.io/?"

let isDownloading = false;

// Toast function
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
        if (width >= 90) clearInterval(interval);
        else {
            width += 2;
            progressBar.style.width = width + "%";
        }
    }, 50);
}

function hideProgress() {
    progressBar.style.width = "100%";
    setTimeout(() => progressContainer.style.display = "none", 500);
}

// Get URL with proxy
function getProxyUrl(endpoint) {
    return `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + endpoint)}`;
}

// Test backend
async function testBackend() {
    try {
        console.log("Testing backend via proxy...");
        
        const proxyUrl = getProxyUrl('/test');
        console.log("Proxy URL:", proxyUrl);
        
        const response = await fetch(proxyUrl);
        console.log("Response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend response:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Backend test error:", error);
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

// Detect platform
function detectPlatform(url) {
    url = url.toLowerCase();
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    return 'Unknown';
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
    
    const platform = detectPlatform(url);
    if (platform === 'Unknown') {
        showToast("Only YouTube, TikTok, Instagram, and Facebook are supported", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Downloading ${platform}...`;
    input.style.border = "2px solid #4CAF50";
    
    showProgress();
    
    try {
        console.log(`Starting ${platform} download:`, url);
        
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
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Download response:", data);
        
        if (data.success) {
            showToast(`✅ ${platform} video downloaded!`, "success");
            
            if (data.filename) {
                downloadMessage.textContent = data.title || "Video";
                // Direct link for file download (no proxy needed)
                downloadLink.href = `${BACKEND_URL}/get_file/${encodeURIComponent(data.filename)}`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('download', data.filename);
                downloadLink.target = "_blank";
                downloadInfo.style.display = "block";
                
                input.value = "";
                input.placeholder = "Download ready! Paste another URL";
                
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
        showToast("Connection error. Try again.", "error");
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
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Initializing...");
    console.log("📡 Backend URL:", BACKEND_URL);
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
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        input.placeholder = "Server connection failed";
        showToast("❌ Server offline", "error");
        console.log("❌ Backend offline");
        
        // Try alternative proxy
        console.log("Trying alternative proxy...");
        CORS_PROXY = "https://corsproxy.io/?";
        const retry = await testBackend();
        if (retry) {
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            button.disabled = false;
            showToast("✅ Connected via alternative proxy", "success");
        }
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
        
        const platform = detectPlatform(url);
        if (platform !== 'Unknown') {
            this.style.border = "2px solid #4CAF50";
            this.style.color = "#4CAF50";
        } else {
            this.style.border = "2px solid #ff9800";
            this.style.color = "#ff9800";
        }
    });
});

// Manual test functions
window.testBackendConnection = testBackend;

window.testDownload = function(url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
    input.value = url;
    downloadVideo();
};

window.directTest = async function() {
    console.log("Direct test without proxy...");
    try {
        const response = await fetch(`${BACKEND_URL}/test`);
        console.log("Direct response:", response.status, response.headers);
        const text = await response.text();
        console.log("Response text:", text);
    } catch (error) {
        console.error("Direct test error:", error);
    }
};
