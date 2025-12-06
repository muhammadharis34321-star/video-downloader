// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Backend URL
const API_BASE = "https://python22.pythonanywhere.com";
let isDownloading = false;

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    if (type === "success") {
        toast.classList.add("success");
    } else if (type === "error") {
        toast.classList.add("error");
    }
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Progress bar
function animateProgress() {
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

function completeProgress() {
    progressBar.style.width = "100%";
    setTimeout(() => {
        progressContainer.style.display = "none";
    }, 500);
}

// Reset form
function resetForm() {
    input.style.border = "2px solid #ddd";
    input.style.color = "#333";
    input.value = "";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Test backend connection
async function testBackend() {
    try {
        console.log("Testing backend connection...");
        const response = await fetch(`${API_BASE}/test`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend connected:", data);
            return true;
        } else {
            console.log("❌ Backend response not OK:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Backend connection failed:", error);
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

// Main download function
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
    
    if (!isValidUrl(url)) {
        showToast("Invalid URL format", "error");
        input.style.border = "2px solid #f44336";
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    input.style.border = "2px solid #4CAF50";
    
    // Show progress
    animateProgress();
    
    try {
        console.log("Sending download request for:", url);
        
        const response = await fetch(`${API_BASE}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });
        
        completeProgress();
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Download response:", data);
        
        if (data.success) {
            showToast("✅ Download successful!", "success");
            
            // Show download info
            downloadMessage.textContent = data.title || "Video";
            downloadLink.href = `${API_BASE}/get_file/${encodeURIComponent(data.filename)}`;
            downloadLink.style.display = "inline-block";
            downloadLink.setAttribute('download', data.filename);
            downloadInfo.style.display = "block";
            
            // Auto reset after 10 seconds
            setTimeout(() => {
                resetForm();
            }, 10000);
            
        } else {
            showToast(data.error || "Download failed", "error");
            setTimeout(() => {
                resetForm();
            }, 3000);
        }
        
    } catch (error) {
        console.error("Download error:", error);
        completeProgress();
        showToast("Connection error. Try again.", "error");
        setTimeout(() => {
            resetForm();
        }, 3000);
    } finally {
        isDownloading = false;
    }
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Initializing...");
    console.log("📡 Backend:", API_BASE);
    
    // Show connecting state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    // Test backend
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste YouTube, TikTok, Instagram, or Facebook URL";
        console.log("✅ System ready");
        showToast("✅ Connected to server", "success");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        input.placeholder = "Server connection failed";
        console.log("❌ Backend offline");
        showToast("❌ Server offline", "error");
    }
    
    // Setup event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !button.disabled && !isDownloading) {
            downloadVideo();
        }
    });
    
    // Real-time URL validation
    input.addEventListener("input", function() {
        const url = this.value.trim();
        if (url) {
            if (isValidUrl(url)) {
                this.style.border = "2px solid #4CAF50";
            } else {
                this.style.border = "2px solid #ff9800";
            }
        } else {
            this.style.border = "2px solid #ddd";
        }
    });
});

// Online/offline detection
window.addEventListener('online', () => {
    console.log("🌐 Internet connection restored");
    testBackend().then(connected => {
        if (connected) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            showToast("✅ Internet restored", "success");
        }
    });
});

window.addEventListener('offline', () => {
    console.log("🌐 Internet connection lost");
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
    showToast("❌ Internet connection lost", "error");
});
