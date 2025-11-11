// Elements select kar rahe hain
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Aapka Replit backend URL
const API_BASE = "https://flask-core-api-muhammadhari142.replit.app";

// App state
let isDownloading = false;

// Toast notification function
function showToast(message, type = "info") {
    toast.textContent = message;
    toast.className = "toast";
    
    // Remove existing classes
    toast.classList.remove("success", "error", "warning");
    
    // Add type class
    if (type === "error") {
        toast.classList.add("error");
    } else if (type === "success") {
        toast.classList.add("success");
    } else if (type === "warning") {
        toast.classList.add("warning");
    }
    
    toast.classList.add("show");
    
    // Auto hide after delay
    const duration = type === "error" ? 5000 : 3000;
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

// Progress bar animation with realistic simulation
function animateProgress(duration = 5000) {
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) { // 90% tak simulate karein, actual complete hone par 100% hoga
            clearInterval(interval);
        } else {
            // Realistic progress simulation
            if (width < 30) {
                width += 1.5; // Start fast
            } else if (width < 70) {
                width += 1; // Medium speed
            } else {
                width += 0.5; // Slow down at end
            }
            progressBar.style.width = width + "%";
        }
    }, duration / 100);
}

// Complete progress bar
function completeProgress() {
    progressBar.style.width = "100%";
    setTimeout(() => {
        progressContainer.style.display = "none";
    }, 1000);
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

// Detect platform from URL for better UX
function detectPlatformFromUrl(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'YouTube';
    } else if (urlLower.includes('tiktok.com')) {
        return 'TikTok';
    } else if (urlLower.includes('instagram.com')) {
        return 'Instagram';
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
        return 'Facebook';
    } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return 'Twitter';
    } else {
        return 'Unknown';
    }
}

// Download video function - IMPROVED VERSION
async function downloadVideo() {
    // Prevent multiple simultaneous downloads
    if (isDownloading) {
        showToast("Please wait, download in progress...", "warning");
        return;
    }
    
    const url = input.value.trim();
    const platform = detectPlatformFromUrl(url);

    // Empty input check
    if (url === "") {
        input.value = "";
        input.placeholder = "⚠️ Please paste a video URL!";
        input.style.border = "2px solid red";
        input.style.color = "red";
        
        showToast("Please enter a video URL", "error");
        
        setTimeout(() => {
            resetForm();
        }, 2000);
        return;
    }

    // Validate URL format
    if (!isValidUrl(url)) {
        input.style.border = "2px solid red";
        input.style.color = "red";
        showToast("Please enter a valid URL (include http:// or https://)", "error");
        return;
    }

    // Platform support check
    if (platform === 'Unknown') {
        input.style.border = "2px solid orange";
        input.style.color = "orange";
        showToast("This platform might not be supported. Trying anyway...", "warning");
    }

    // Set downloading state
    isDownloading = true;
    input.style.border = "2px solid #4CAF50";
    input.style.color = "#4CAF50";
    input.placeholder = `✅ Processing ${platform} video...`;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';

    // Show progress animation
    animateProgress(8000); // 8 seconds initial animation

    try {
        console.log("🔄 Sending request to backend...");
        console.log("📡 URL:", `${API_BASE}/download`);
        console.log("🔗 Video URL:", url);

        // Backend API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

        const response = await fetch(`${API_BASE}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Complete progress bar
        completeProgress();

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ HTTP Error:", response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("📨 Response received:", data);

        if (data.success) {
            showToast(`✅ Successfully processed ${data.platform} video!`, "success");

            // Show download info
            downloadMessage.textContent = `Downloaded: ${data.title || 'Video'}`;
            
            // Correct download link - PythonAnywhere compatible
            downloadLink.href = `${API_BASE}/downloads/${encodeURIComponent(data.filename)}`;
            downloadLink.style.display = "inline-block";
            downloadLink.setAttribute('download', data.filename);
            downloadInfo.style.display = "block";

            input.placeholder = "✅ Download ready! Paste another URL";
            input.style.border = "2px solid #4CAF50";
            
            // Auto reset after 10 seconds
            setTimeout(() => {
                if (isDownloading) {
                    resetForm();
                }
            }, 10000);
            
        } else {
            throw new Error(data.error || "Download failed - unknown error");
        }

    } catch (error) {
        console.error("❌ Download error:", error);
        completeProgress();

        let errorMessage = "Download failed: ";
        let toastType = "error";

        if (error.name === "AbortError") {
            errorMessage = "Request timeout. Video might be too long or server is busy.";
            toastType = "warning";
        } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            errorMessage = "Cannot connect to server. Please check your internet connection and try again.";
        } else if (error.message.includes("Server error: 500")) {
            errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes("Server error: 404")) {
            errorMessage = "Server endpoint not found. Please check the backend URL.";
        } else if (error.message.includes("Unsupported platform")) {
            errorMessage = "This platform is not supported. Try YouTube, TikTok, Instagram, or Facebook.";
        } else {
            errorMessage += error.message;
        }

        showToast(errorMessage, toastType);
        input.placeholder = "❌ Download failed. Try again.";
        input.style.border = "2px solid red";
        input.style.color = "red";

        // Reset after 5 seconds
        setTimeout(() => {
            resetForm();
        }, 5000);
    } finally {
        isDownloading = false;
    }
}

// Test backend connection
async function testBackendConnection() {
    try {
        console.log("🔍 Testing backend connection...");
        const response = await fetch(`${API_BASE}/status`);
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Backend test successful:", data);
            showToast(`✅ Connected to ${data.version || 'backend'}`, "success");
            return true;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error("❌ Backend test failed:", error);
        showToast("⚠️ Backend server not connected", "warning");
        return false;
    }
}

// Check supported platforms
async function checkSupportedPlatforms() {
    try {
        const response = await fetch(`${API_BASE}/supported-platforms`);
        if (response.ok) {
            const data = await response.json();
            console.log("📱 Supported platforms:", data.platforms);
            return data.platforms;
        }
    } catch (error) {
        console.warn("Could not fetch supported platforms:", error);
    }
    return null;
}

// Update UI based on backend status
async function updateUIStatus() {
    const isConnected = await testBackendConnection();
    const platforms = await checkSupportedPlatforms();
    
    if (isConnected) {
        button.style.background = "linear-gradient(135deg, #4caf50, #45a049)";
        input.placeholder = "Paste TikTok, Instagram, YouTube, or Facebook URL here";
    } else {
        button.style.background = "linear-gradient(135deg, #ff9800, #f57c00)";
        input.placeholder = "⚠️ Backend not connected - Check server";
        button.disabled = true;
    }
}

// Input validation while typing
function validateInput() {
    const url = input.value.trim();
    
    if (url === "") {
        input.style.border = "2px solid #ddd";
        return;
    }
    
    if (isValidUrl(url)) {
        const platform = detectPlatformFromUrl(url);
        if (platform !== 'Unknown') {
            input.style.border = "2px solid #4CAF50";
            input.style.color = "#4CAF50";
        } else {
            input.style.border = "2px solid orange";
            input.style.color = "orange";
        }
    } else {
        input.style.border = "2px solid red";
        input.style.color = "red";
    }
}

// Event Listeners

// Button click event
button.addEventListener("click", downloadVideo);

// Input field events
input.addEventListener("input", validateInput);

input.addEventListener("focus", () => {
    if (input.value === "" || isValidUrl(input.value.trim())) {
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
    showToast("Download started!", "success");
    // Reset form after click
    setTimeout(() => {
        resetForm();
    }, 2000);
});

// Page load initialization
window.addEventListener("load", async () => {
    console.log("🚀 Frontend loaded, initializing...");
    console.log("📡 Backend URL:", API_BASE);
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    // Check backend status
    await updateUIStatus();
    
    // Enable button if backend is connected
    const isConnected = await testBackendConnection();
    if (isConnected) {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        showToast("Video Downloader is ready!", "success");
    }
    
    console.log("✅ Frontend initialization complete");
});

// Online/offline detection
window.addEventListener('online', () => {
    showToast("Internet connection restored", "success");
    updateUIStatus();
});

window.addEventListener('offline', () => {
    showToast("Internet connection lost", "error");
    button.disabled = true;
    button.style.background = "linear-gradient(135deg, #757575, #9e9e9e)";
});

// Service Worker registration (optional - for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
