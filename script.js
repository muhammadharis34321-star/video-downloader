const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

const API_BASE = "https://python22.pythonanywhere.com";
let isDownloading = false;

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

async function testBackend() {
    try {
        console.log("Testing backend:", `${API_BASE}/ping`);
        
        const response = await fetch(`${API_BASE}/ping`, {
            method: 'GET',
            mode: 'cors'
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers.entries()]);
        
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

async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    if (!url) {
        showToast("Enter a video URL", "error");
        return;
    }
    
    // Simple URL validation
    if (!url.includes('http') || !url.includes('.')) {
        showToast("Invalid URL format", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        console.log("Sending download request for:", url);
        
        const response = await fetch(`${API_BASE}/download`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        console.log("Download response:", data);
        
        if (data.success) {
            showToast("✅ Download successful!", "success");
            
            if (data.filename) {
                downloadMessage.textContent = data.title || "Video";
                downloadLink.href = `${API_BASE}/get_file/${encodeURIComponent(data.filename)}`;
                downloadLink.style.display = "inline-block";
                downloadInfo.style.display = "block";
            }
            
            input.value = "";
            
            setTimeout(() => {
                resetForm();
            }, 8000);
        } else {
            showToast(data.error || "Download failed", "error");
            setTimeout(() => resetForm(), 3000);
        }
        
    } catch (error) {
        console.error("Download error:", error);
        showToast("Connection error", "error");
        setTimeout(() => resetForm(), 3000);
    } finally {
        isDownloading = false;
    }
}

function resetForm() {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    downloadInfo.style.display = "none";
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Initializing Video Downloader");
    console.log("📡 Backend URL:", API_BASE);
    console.log("🌐 Frontend URL:", window.location.origin);
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste YouTube, TikTok, Instagram, or Facebook URL";
        showToast("✅ Connected to server", "success");
        console.log("✅ System ready");
    } else {
        button.innerHTML = '<i class="fas fa-times-circle"></i> Offline';
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
    
    // Input validation
    input.addEventListener("input", function() {
        const url = this.value.trim();
        if (url) {
            if (url.includes('http') && url.includes('.')) {
                this.style.border = "2px solid #4CAF50";
            } else {
                this.style.border = "2px solid #f44336";
            }
        } else {
            this.style.border = "2px solid #ddd";
        }
    });
});

// Manual test function
window.testConnection = async function() {
    console.log("🧪 Manual test started...");
    const result = await testBackend();
    showToast(result ? "✅ Connected" : "❌ Failed", result ? "success" : "error");
    return result;
};
