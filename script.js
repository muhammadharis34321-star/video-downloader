// Elements select kar rahe hain
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ TUMHARA APNA BACKEND
const BACKEND_URL = "https://python22.pythonanywhere.com";
const API_BASE = BACKEND_URL; // ✅ ADD THIS LINE

// App state
let isDownloading = false;
let supportedPlatforms = ['YouTube', 'TikTok', 'Instagram', 'Facebook'];

// Toast notification function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    
    // Auto hide after delay
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

// Reset form to initial state
function resetForm() {
    input.style.border = "2px solid #ddd";
    input.style.color = "#333";
    input.placeholder = "Paste TikTok, Instagram, YouTube, or Facebook URL here";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    downloadLink.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    
    // Update button text
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Validate URL format
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

// Detect platform from URL with strict validation
function detectPlatformFromUrl(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'YouTube';
    } else if (urlLower.includes('tiktok.com') && urlLower.includes('/video/')) {
        return 'TikTok';
    } else if (urlLower.includes('instagram.com') && (urlLower.includes('/p/') || urlLower.includes('/reel/'))) {
        return 'Instagram';
    } else if (urlLower.includes('facebook.com') && urlLower.includes('/video/')) {
        return 'Facebook';
    } else {
        return 'Unknown';
    }
}

// Strict URL validation for supported platforms
function isSupportedPlatformUrl(url) {
    const platform = detectPlatformFromUrl(url);
    
    if (platform === 'Unknown') {
        return {
            valid: false,
            message: "Invalid URL. Only YouTube, TikTok, Instagram, and Facebook video URLs are supported."
        };
    }
    
    // Additional checks for each platform
    const urlLower = url.toLowerCase();
    
    if (platform === 'YouTube') {
        if (!(urlLower.includes('watch?v=') || urlLower.includes('youtu.be/'))) {
            return {
                valid: false,
                message: "Invalid YouTube URL. Must be a video link."
            };
        }
    }
    
    if (platform === 'TikTok') {
        if (!urlLower.includes('/video/')) {
            return {
                valid: false,
                message: "Invalid TikTok URL. Must be a video link."
            };
        }
    }
    
    if (platform === 'Instagram') {
        if (!(urlLower.includes('/p/') || urlLower.includes('/reel/'))) {
            return {
                valid: false,
                message: "Invalid Instagram URL. Must be a post or reel link."
            };
        }
    }
    
    if (platform === 'Facebook') {
        if (!urlLower.includes('/video/')) {
            return {
                valid: false,
                message: "Invalid Facebook URL. Must be a video link."
            };
        }
    }
    
    return {
        valid: true,
        platform: platform
    };
}

// Main download function
async function downloadVideo() {
    // Prevent multiple downloads
    if (isDownloading) {
        showToast("Please wait, current download in progress...", "error");
        return;
    }
    
    const url = input.value.trim();
    
    // Empty URL check
    if (!url) {
        showToast("Please paste a video URL first", "error");
        input.focus();
        return;
    }
    
    // Basic URL format check
    if (!isValidUrl(url)) {
        showToast("Please enter a valid URL starting with http:// or https://", "error");
        input.style.border = "2px solid #f44336";
        return;
    }
    
    // Strict platform validation
    const validation = isSupportedPlatformUrl(url);
    if (!validation.valid) {
        showToast(validation.message, "error");
        input.style.border = "2px solid #f44336";
        return;
    }
    
    // Start download process
    isDownloading = true;
    const platform = validation.platform;
    
    // Update UI
    input.style.border = "2px solid #4CAF50";
    input.style.color = "#4CAF50";
    input.placeholder = `Downloading ${platform} video...`;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing ${platform}...`;
    
    // Show progress
    animateProgress();
    
    try {
        console.log(`🚀 Starting download: ${url}`);
        console.log(`📱 Platform: ${platform}`);
        console.log(`🔗 Backend: ${BACKEND_URL}/download`);
        
        // Send request to backend
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ url: url })
        });
        
        completeProgress();
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📦 Response:", data);
        
        if (data.success) {
            showToast(`✅ ${platform} video downloaded successfully!`, "success");
            
            // Show download info
            const title = data.title || 'Video';
            downloadMessage.textContent = `"${title}" ready to download`;
            
            // Set download link - CORRECTED URL
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
        completeProgress();
        
        let errorMessage = "Download failed. ";
        
        if (error.message.includes("Failed to fetch")) {
            errorMessage += "Cannot connect to server. Check your internet or backend URL.";
        } else if (error.message.includes("404")) {
            errorMessage += "Server endpoint not found. Check backend configuration.";
        } else if (error.message.includes("500")) {
            errorMessage += "Server error. Please try again.";
        } else if (error.message.includes("Unsupported platform")) {
            errorMessage += "Platform not supported. Use YouTube, TikTok, Instagram or Facebook.";
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
    
    const validation = isSupportedPlatformUrl(url);
    if (validation.valid) {
        input.style.border = "2px solid #4CAF50";
        input.style.color = "#4CAF50";
        button.disabled = false;
    } else {
        input.style.border = "2px solid #f44336";
        input.style.color = "#f44336";
        button.disabled = false;
    }
}

// Test backend connection
async function checkBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}/test`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend connected:", data);
            showToast("Connected to server", "success");
            return true;
        }
        return false;
    } catch (error) {
        console.log("❌ Backend not reachable");
        return false;
    }
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
    if (e.key === "Enter" && !isDownloading) {
        downloadVideo();
    }
});

// Download link click event
downloadLink.addEventListener("click", (e) => {
    showToast("Starting download...", "success");
    // Reset form after click
    setTimeout(() => {
        resetForm();
    }, 2000);
});

// Initialize on page load
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader initialized");
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    
    // Check backend
    const isConnected = await checkBackend();
    
    if (isConnected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        input.placeholder = "Paste video URL and click Download";
        console.log("✅ System ready");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        button.disabled = true;
        input.placeholder = "Server offline. Please check backend.";
        input.style.border = "2px solid #f44336";
        showToast("Backend server is offline", "error");
        console.log("❌ Server offline");
    }
});

// Online/offline detection
window.addEventListener('online', () => {
    console.log("🌐 Online: Internet connection restored");
    checkBackend();
});

window.addEventListener('offline', () => {
    console.log("🌐 Offline: No internet connection");
    showToast("Internet connection lost", "error");
    button.disabled = true;
});
