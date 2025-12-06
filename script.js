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
const CORS_PROXY = "https://corsproxy.io/?"; // Ya "https://api.allorigins.win/raw?url="

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
    setTimeout(() => {
        progressContainer.style.display = "none";
    }, 500);
}

// Test backend using CORS proxy
async function testBackend() {
    try {
        console.log("Testing backend via CORS proxy...");
        
        // Method 1: Use corsproxy.io
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(BACKEND_URL + '/test')}`;
        
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend via proxy:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.log("Trying alternative proxy...");
        
        // Method 2: Use allorigins.win
        try {
            const altProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(BACKEND_URL + '/test')}`;
            const response2 = await fetch(altProxy);
            
            if (response2.ok) {
                const data = await response2.json();
                console.log("✅ Backend via allorigins:", data);
                return true;
            }
        } catch (e) {
            console.log("All proxies failed");
        }
        
        return false;
    }
}

// Download function using proxy
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    if (!url) {
        showToast("Please enter a video URL", "error");
        return;
    }
    
    // Simple URL validation
    if (!url.startsWith('http')) {
        showToast("Invalid URL format", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    input.style.border = "2px solid #4CAF50";
    
    showProgress();
    
    try {
        console.log("Downloading:", url);
        
        // Use proxy for download too
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(BACKEND_URL + '/download')}`;
        
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
            showToast("✅ Download successful!", "success");
            
            // Show download link
            if (data.filename) {
                downloadMessage.textContent = data.title || "Video";
                // Direct link for file download (no proxy needed for file)
                downloadLink.href = `${BACKEND_URL}/get_file/${encodeURIComponent(data.filename)}`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('download', data.filename);
                downloadInfo.style.display = "block";
            }
            
            // Auto reset
            setTimeout(() => {
                resetForm();
            }, 10000);
            
        } else {
            showToast(data.error || "Download failed", "error");
            setTimeout(() => resetForm(), 3000);
        }
        
    } catch (error) {
        console.error("Error:", error);
        hideProgress();
        showToast("Connection error", "error");
        setTimeout(() => resetForm(), 3000);
    } finally {
        isDownloading = false;
    }
}

function resetForm() {
    input.value = "";
    input.style.border = "2px solid #ddd";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Starting...");
    console.log("📡 Backend:", BACKEND_URL);
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL (YouTube, TikTok, Instagram, Facebook)";
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
        if (e.key === "Enter" && !button.disabled) {
            downloadVideo();
        }
    });
    
    // URL validation
    input.addEventListener("input", function() {
        const url = this.value.trim();
        if (url) {
            if (url.includes('http') && url.includes('.')) {
                this.style.border = "2px solid #4CAF50";
            } else {
                this.style.border = "2px solid #ff9800";
            }
        } else {
            this.style.border = "2px solid #ddd";
        }
    });
});

// Manual test function
window.testConnection = testBackend;
