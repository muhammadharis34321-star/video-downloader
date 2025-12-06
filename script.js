// Elements select kar rahe hain
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Backend API URL
const API_BASE = "https://python22.pythonanywhere.com";

// App state
let isDownloading = false;

// Toast notification function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Progress bar animation
function animateProgress() {
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) {
            clearInterval(interval);
        } else {
            width += 1;
            progressBar.style.width = width + "%";
        }
    }, 50);
}

// Complete progress bar
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
    input.placeholder = "Paste TikTok, Instagram, YouTube, or Facebook URL here";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    downloadLink.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

// Test backend connection - IMPROVED VERSION
async function checkBackend() {
    try {
        console.log("🔍 Testing backend connection...");
        
        const response = await fetch(`${API_BASE}/test`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log("📡 Response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend connected:", data);
            return true;
        } else {
            console.log("❌ Response not OK:", response.status);
            return false;
        }
    } catch (error) {
        console.log("❌ Fetch error:", error.message);
        return false;
    }
}

// Quick test endpoint
async function quickTest() {
    try {
        // Try multiple endpoints
        const endpoints = ['/test', '/status', '/'];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(API_BASE + endpoint, {
                    method: 'GET',
                    mode: 'cors'
                });
                console.log(`Endpoint ${endpoint}: ${response.status}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("✅ Quick test passed:", data);
                    return true;
                }
            } catch (e) {
                console.log(`Endpoint ${endpoint} failed:`, e.message);
            }
        }
        return false;
    } catch (error) {
        console.log("Quick test failed:", error);
        return false;
    }
}

// Simple download function for testing
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please enter a URL", "error");
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast("Invalid URL format", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    animateProgress();
    
    try {
        console.log("Sending request to backend...");
        
        const response = await fetch(`${API_BASE}/download`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });
        
        completeProgress();
        
        if (response.ok) {
            const data = await response.json();
            console.log("Response:", data);
            
            if (data.success) {
                showToast("✅ Download successful!", "success");
                
                // Show download link for testing
                downloadMessage.textContent = data.message || "Video ready";
                downloadInfo.style.display = "block";
                
                // Auto reset
                setTimeout(() => {
                    resetForm();
                }, 5000);
            } else {
                showToast(data.error || "Download failed", "error");
                setTimeout(resetForm, 3000);
            }
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
        
    } catch (error) {
        console.error("Error:", error);
        completeProgress();
        showToast("Connection error. Try again.", "error");
        setTimeout(resetForm, 3000);
    } finally {
        isDownloading = false;
    }
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Initializing...");
    console.log("📡 Backend:", API_BASE);
    console.log("🌐 Frontend:", window.location.origin);
    
    // Show loading
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    // Test backend
    const isConnected = await checkBackend();
    
    if (isConnected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL and click Download";
        console.log("✅ System ready");
        showToast("Connected to server", "success");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        input.placeholder = "Backend connection failed";
        console.log("❌ Backend offline");
        
        // Try quick test
        const quickResult = await quickTest();
        if (quickResult) {
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            button.disabled = false;
            showToast("Backend connected!", "success");
        }
    }
    
    // Set up event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isDownloading && !button.disabled) {
            downloadVideo();
        }
    });
});

// Manual test function (for console testing)
window.testBackend = async function() {
    console.log("🧪 Testing backend manually...");
    const result = await checkBackend();
    console.log("Result:", result ? "✅ Connected" : "❌ Failed");
    return result;
};
