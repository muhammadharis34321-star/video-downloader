const API_BASE = "https://python22.pythonanywhere.com";
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

async function testBackend() {
    try {
        const response = await fetch(`${API_BASE}/ping`);
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Backend error:", error);
        return false;
    }
}

async function downloadVideo() {
    const url = input.value.trim();
    if (!url) {
        showToast("Enter URL", "error");
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    
    try {
        const response = await fetch(`${API_BASE}/download`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        console.log("Response:", data);
        
        if (data.success) {
            showToast("✅ Download successful!", "success");
            input.value = "";
        } else {
            showToast(data.error || "Failed", "error");
        }
    } catch (error) {
        showToast("Connection error", "error");
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    }
}

window.addEventListener("load", async () => {
    console.log("🚀 Initializing...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        showToast("✅ Connected", "success");
    } else {
        button.innerHTML = '<i class="fas fa-times"></i> Offline';
        showToast("❌ Server offline", "error");
    }
    
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !button.disabled) {
            downloadVideo();
        }
    });
});
