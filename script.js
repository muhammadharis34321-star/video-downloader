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
        console.log("Testing:", `${API_BASE}/ping`);
        const response = await fetch(`${API_BASE}/ping`);
        const data = await response.json();
        console.log("✅ Backend:", data);
        return true;
    } catch (error) {
        console.log("❌ Backend error:", error);
        return false;
    }
}

async function downloadVideo() {
    if (isDownloading) return;
    
    const url = input.value.trim();
    if (!url) {
        showToast("Enter a video URL", "error");
        return;
    }
    
    try {
        new URL(url);
    } catch {
        showToast("Invalid URL", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    
    try {
        const response = await fetch(`${API_BASE}/download`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        console.log("Download response:", data);
        
        if (data.success) {
            showToast("✅ Download successful!", "success");
            downloadMessage.textContent = data.title || "Video";
            downloadLink.href = `${API_BASE}/get_file/${encodeURIComponent(data.filename)}`;
            downloadLink.style.display = "inline-block";
            downloadInfo.style.display = "block";
            input.value = "";
            
            setTimeout(() => {
                resetForm();
            }, 10000);
        } else {
            showToast(data.error || "Failed", "error");
            setTimeout(() => resetForm(), 3000);
        }
        
    } catch (error) {
        console.error("Error:", error);
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
    console.log("Initializing...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL";
        showToast("✅ Connected to server", "success");
    } else {
        button.innerHTML = '<i class="fas fa-times-circle"></i> Offline';
        input.placeholder = "Server connection failed";
        showToast("❌ Server offline", "error");
    }
    
    // Events
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !button.disabled) {
            downloadVideo();
        }
    });
});

// Manual test
window.testBackendManual = testBackend;
