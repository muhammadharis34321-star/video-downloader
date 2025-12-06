// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// URLs - Use direct connection first
const BACKEND_URL = "https://python22.pythonanywhere.com";
const CORS_PROXY = "https://corsproxy.io/?";

let isDownloading = false;

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

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

// Test backend
async function testBackend() {
    try {
        // Try direct first
        const response = await fetch(`${BACKEND_URL}/test`);
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Direct connection:", data);
            return true;
        }
    } catch (e) {
        console.log("Direct failed, trying proxy...");
        
        // Try with proxy
        try {
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/test')}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Proxy connection:", data);
                return true;
            }
        } catch (proxyError) {
            console.log("Both methods failed");
        }
    }
    return false;
}

// Download function - Try multiple methods
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    if (!url) {
        showToast("Enter video URL", "error");
        return;
    }
    
    if (!url.includes('http')) {
        showToast("Invalid URL", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    showProgress();
    
    try {
        console.log("Starting download for:", url);
        
        // Method 1: Try direct
        let response;
        try {
            response = await fetch(`${BACKEND_URL}/download`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ url: url })
            });
            console.log("Direct response status:", response.status);
        } catch (directError) {
            console.log("Direct failed:", directError);
            
            // Method 2: Try with proxy
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/download')}`;
            response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ url: url })
            });
            console.log("Proxy response status:", response.status);
        }
        
        hideProgress();
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Download result:", data);
        
        if (data.success) {
            showToast("✅ Download successful!", "success");
            
            if (data.filename) {
                downloadMessage.textContent = data.title || "Video";
                downloadLink.href = `${BACKEND_URL}/get_file/${encodeURIComponent(data.filename)}`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('download', data.filename);
                downloadInfo.style.display = "block";
                
                input.value = "";
                
                setTimeout(() => {
                    resetForm();
                }, 10000);
            }
        } else {
            showToast(data.error || "Failed", "error");
            setTimeout(() => resetForm(), 3000);
        }
        
    } catch (error) {
        console.error("Error:", error);
        hideProgress();
        showToast("Download failed: " + error.message, "error");
        setTimeout(() => resetForm(), 3000);
    } finally {
        isDownloading = false;
    }
}

function resetForm() {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    downloadInfo.style.display = "none";
    progressContainer.style.display = "none";
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Starting...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL";
        showToast("✅ Connected", "success");
    } else {
        button.innerHTML = '<i class="fas fa-times"></i> Offline';
        showToast("❌ Connection failed", "error");
    }
    
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !button.disabled) {
            downloadVideo();
        }
    });
});

// Manual test function
window.testDownload = function(testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
    input.value = testUrl;
    downloadVideo();
};
