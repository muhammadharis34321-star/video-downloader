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
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

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

// Get proxy URL
function getProxyUrl(endpoint) {
    return `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + endpoint)}`;
}

// Test backend connection
async function testBackend() {
    try {
        console.log("🔍 Testing backend connection...");
        
        const proxyUrl = getProxyUrl('/test');
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend connected:", data);
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
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'YouTube';
    } else if (url.includes('tiktok.com')) {
        return 'TikTok';
    } else if (url.includes('instagram.com')) {
        return 'Instagram';
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
        return 'Facebook';
    }
    return 'Unknown';
}

// Main download function
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait, download in progress...", "error");
        return;
    }
    
    const url = input.value.trim();
    
    // Empty URL check
    if (!url) {
        showToast("Please paste a video URL first", "error");
        input.focus();
        return;
    }
    
    // URL format check
    if (!isValidUrl(url)) {
        showToast("Please enter a valid URL (include http:// or https://)", "error");
        input.style.border = "2px solid #f44336";
        return;
    }
    
    // Platform check
    const platform = detectPlatform(url);
    if (platform === 'Unknown') {
        showToast("Only YouTube, TikTok, Instagram, and Facebook are supported", "error");
        input.style.border = "2px solid #f44336";
        return;
    }
    
    // Start download process
    isDownloading = true;
    
    // Update UI
    input.style.border = "2px solid #4CAF50";
    input.style.color = "#4CAF50";
    input.placeholder = `Downloading ${platform} video...`;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing ${platform}...`;
    
    // Show progress
    showProgress();
    
    try {
        console.log(`🚀 Starting download: ${url}`);
        console.log(`📱 Platform: ${platform}`);
        
        // Send request via proxy
        const proxyUrl = getProxyUrl('/download');
        
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });
        
        hideProgress();
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error("Non-JSON response:", text.substring(0, 200));
            throw new Error("Server returned HTML instead of JSON");
        }
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📦 Response:", data);
        
        if (data.success) {
            showToast(`✅ ${platform} video downloaded successfully!`, "success");
            
            // Show download info
            const title = data.title || 'Video';
            downloadMessage.textContent = `"${title}" ready to download`;
            
            // Set download link
            downloadLink.href = `${BACKEND_URL}/get_file/${encodeURIComponent(data.filename)}`;
            downloadLink.style.display = "inline-block";
            downloadLink.setAttribute('download', data.filename);
            downloadLink.setAttribute('target', '_blank');
            downloadInfo.style.display = "block";
            
            input.placeholder = "Download ready! Paste another URL";
            
            // Auto reset after 15 seconds
            setTimeout(() => {
                if (isDownloading) {
                    resetForm();
                }
            }, 15000);
            
        } else {
            throw new Error(data.error || "Download failed");
        }
        
    } catch (error) {
        console.error("❌ Download error:", error);
        hideProgress();
        
        let errorMessage = "Download failed. ";
        
        if (error.message.includes("429")) {
            errorMessage += "Too many requests. Try again later.";
        } else if (error.message.includes("404")) {
            errorMessage += "Video not found or endpoint doesn't exist.";
        } else if (error.message.includes("403")) {
            errorMessage += "Access denied by the platform.";
        } else if (error.message.includes("HTML instead of JSON")) {
            errorMessage += "Server error. Check backend logs.";
        } else {
            errorMessage += error.message;
        }
        
        showToast(errorMessage, "error");
        input.placeholder = "Download failed. Try again.";
        input.style.border = "2px solid #f44336";
        
        // Reset after 5 seconds
        setTimeout(() => {
            resetForm();
        }, 5000);
        
    } finally {
        isDownloading = false;
    }
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

// Real-time input validation
function validateInput() {
    const url = input.value.trim();
    
    if (!url) {
        input.style.border = "2px solid #ddd";
        input.style.color = "#333";
        button.disabled = false;
        return;
    }
    
    if (!isValidUrl(url)) {
        input.style.border = "2px solid #ff9800";
        input.style.color = "#ff9800";
        button.disabled = false;
        return;
    }
    
    const platform = detectPlatform(url);
    if (platform !== 'Unknown') {
        input.style.border = "2px solid #4CAF50";
        input.style.color = "#4CAF50";
        button.disabled = false;
    } else {
        input.style.border = "2px solid #f44336";
        input.style.color = "#f44336";
        button.disabled = false;
    }
}

// Initialize on page load
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Initializing...");
    console.log("📡 Backend URL:", BACKEND_URL);
    console.log("🔗 CORS Proxy:", CORS_PROXY);
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    // Test backend connection
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL and click Download";
        console.log("✅ System ready");
        showToast("✅ Connected to server", "success");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        input.placeholder = "Server connection failed";
        console.log("❌ Backend offline");
        showToast("❌ Server offline", "error");
    }
    
    // Event Listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("input", validateInput);
    
    input.addEventListener("focus", () => {
        if (input.style.border !== "2px solid #f44336") {
            input.style.border = "2px solid #4CAF50";
        }
    });
    
    input.addEventListener("blur", () => {
        validateInput();
    });
    
    // Enter key support
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isDownloading && !button.disabled) {
            downloadVideo();
        }
    });
    
    // Download link click event
    downloadLink.addEventListener("click", (e) => {
        showToast("Download started!", "success");
        // Reset form after click
        setTimeout(() => {
            resetForm();
        }, 2000);
    });
});

// Online/offline detection
window.addEventListener('online', () => {
    console.log("🌐 Online: Internet connection restored");
    testBackend();
});

window.addEventListener('offline', () => {
    console.log("🌐 Offline: No internet connection");
    showToast("Internet connection lost", "error");
    button.disabled = true;
});

// Manual test functions
window.testConnection = async function() {
    console.log("🧪 Manual connection test...");
    const result = await testBackend();
    showToast(result ? "✅ Connected" : "❌ Failed", result ? "success" : "error");
    return result;
};

window.quickTest = function(url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
    input.value = url;
    downloadVideo();
};

window.debugInfo = function() {
    console.log("=== DEBUG INFO ===");
    console.log("Backend:", BACKEND_URL);
    console.log("CORS Proxy:", CORS_PROXY);
    console.log("Is Downloading:", isDownloading);
    console.log("Input Value:", input.value);
    console.log("==================");
};
