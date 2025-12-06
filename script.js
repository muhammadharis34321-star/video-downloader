// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ BACKEND URL - Tumhara PythonAnywhere
const BACKEND_URL = "https://python22.pythonanywhere.com";

// ✅ NEW CORS PROXY (working)
const CORS_PROXY = "https://corsproxy.io/?";

let isDownloading = false;

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast " + type + " show";
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// Progress bar
function showProgress(p) {
    progressContainer.style.display = "block";
    progressBar.style.width = p + "%";
}

function hideProgress() {
    progressBar.style.width = "100%";
    setTimeout(() => progressContainer.style.display = "none", 500);
}

// JavaScript code mein ye function update karo
async function testBackend() {
    try {
        console.log("Testing backend connection...");
        
        // ✅ DIRECT call try (with credentials disable)
        console.log("Trying direct call...");
        try {
            const response = await fetch(`${BACKEND_URL}/test`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Backend direct connection:", data);
                return true;
            }
        } catch (directError) {
            console.log("Direct call failed:", directError);
        }
        
        // ✅ Agar direct nahi chala, toh proxy se try karo
        console.log("Trying via proxy...");
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/test')}`;
        const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            console.log("✅ Backend via proxy:", data);
            return true;
        }
        
        console.log("❌ Both methods failed");
        return false;
    } catch (error) {
        console.error("Test error:", error);
        return false;
    }
}

// URL validation
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
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    return 'Unknown';
}

// ✅ MAIN DOWNLOAD FUNCTION - WORKING
async function downloadVideo() {
    if (isDownloading) {
        showToast("Please wait...", "error");
        return;
    }
    
    const url = input.value.trim();
    
    if (!url) {
        showToast("Paste video URL first", "error");
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast("Invalid URL format", "error");
        return;
    }
    
    const platform = detectPlatform(url);
    if (platform === 'Unknown') {
        showToast("Supported: YouTube, TikTok, Instagram, Facebook", "error");
        return;
    }
    
    isDownloading = true;
    input.style.border = "2px solid #4CAF50";
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Downloading...`;
    showProgress(30);
    
    try {
        console.log(`🎬 Downloading ${platform} video: ${url}`);
        
        // ✅ Try different methods
        let response;
        
        try {
            // Method 1: Direct call
            console.log("Trying direct call...");
            response = await fetch(`${BACKEND_URL}/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url })
            });
        } catch (directError) {
            console.log("Direct failed, trying proxy...");
            
            // Method 2: CORS proxy
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/download')}`;
            response = await fetch(proxyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url })
            });
        }
        
        showProgress(70);
        
        // Get response text first
        const responseText = await response.text();
        console.log("Raw response:", responseText.substring(0, 200));
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            throw new Error("Server returned invalid response");
        }
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        if (data.success) {
            showProgress(100);
            
            setTimeout(() => {
                hideProgress();
                
                // Success!
                showToast(`✅ ${platform} video ready!`, "success");
                
                // Show download info
                downloadMessage.textContent = `"${data.title}" ready to download`;
                
                // Set download link
                if (data.filename) {
                    const downloadUrl = `${BACKEND_URL}/get_file/${data.filename}`;
                    downloadLink.href = downloadUrl;
                    downloadLink.download = `${data.title || 'video'}.mp4`;
                    downloadLink.style.display = "inline-block";
                    downloadInfo.style.display = "block";
                    
                    console.log("📥 Download URL:", downloadUrl);
                }
                
                input.placeholder = "Ready! Paste another URL";
                
                // Auto reset
                setTimeout(() => {
                    if (isDownloading) resetForm();
                }, 20000);
                
            }, 1000);
            
        } else {
            throw new Error(data.error || "Download failed");
        }
        
    } catch (error) {
        console.error("❌ Download error:", error);
        hideProgress();
        showToast(`Error: ${error.message}`, "error");
        
        // Reset form
        setTimeout(() => {
            resetForm();
        }, 3000);
        
    } finally {
        isDownloading = false;
    }
}

// Reset form
function resetForm() {
    input.value = "";
    input.style.border = "2px solid #ddd";
    input.style.color = "#333";
    input.placeholder = "Paste video URL here";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    downloadLink.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Input validation
input.addEventListener("input", function() {
    const url = this.value.trim();
    
    if (!url) {
        this.style.border = "2px solid #ddd";
        return;
    }
    
    if (!isValidUrl(url)) {
        this.style.border = "2px solid #ff9800";
        return;
    }
    
    const platform = detectPlatform(url);
    if (platform !== 'Unknown') {
        this.style.border = "2px solid #4CAF50";
    } else {
        this.style.border = "2px solid #f44336";
    }
});

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Starting...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    const connected = await testBackend();
    
    if (connected) {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste video URL and click Download";
        showToast("✅ Connected to server", "success");
    } else {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server Offline';
        input.placeholder = "Server connection failed";
        showToast("❌ Server offline", "error");
    }
    
    // Event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isDownloading && !button.disabled) {
            downloadVideo();
        }
    });
});

// Debug functions
window.testServer = testBackend;

window.quickTest = function() {
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    downloadVideo();
};
