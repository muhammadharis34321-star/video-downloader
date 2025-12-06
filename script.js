// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ BACKEND URL
const BACKEND_URL = "https://python22.pythonanywhere.com";
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

// ✅ Test backend - ALWAYS USE PROXY
async function testBackend() {
    try {
        console.log("🔗 Testing connection...");
        
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/test')}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Connected:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Connection failed:", error);
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

// ✅ DIFFERENT CORS PROXIES TRY KARO
const CORS_PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?", 
    "https://proxy.cors.sh/",
    "https://cors-anywhere.herokuapp.com/"
];

// ✅ MODIFIED downloadVideo function
async function downloadVideo() {
    if (isDownloading) return;
    
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
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Downloading...`;
    showProgress(30);
    
    try {
        console.log(`🎬 Downloading ${platform} video...`);
        
        // ✅ Try different proxies
        let response, error;
        
        for (const proxy of CORS_PROXIES) {
            try {
                const proxyUrl = proxy === "https://proxy.cors.sh/" 
                    ? `https://proxy.cors.sh/${BACKEND_URL}/download`
                    : `${proxy}${encodeURIComponent(BACKEND_URL + '/download')}`;
                
                console.log(`Trying proxy: ${proxy}`);
                
                response = await fetch(proxyUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(proxy === "https://proxy.cors.sh/" && {
                            "x-cors-api-key": "temp_09a95c0c57d3c78c0c93c0c4a1c4b1c0"
                        })
                    },
                    body: JSON.stringify({ url: url })
                });
                
                if (response.ok) break;
                
            } catch (err) {
                error = err;
                console.log(`Proxy failed: ${proxy}`);
            }
        }
        
        if (!response || !response.ok) {
            throw new Error("All proxies failed");
        }
        
        showProgress(70);
        
        const data = await response.json();
        console.log("✅ Server response:", data);
        
        if (data.success) {
            showProgress(100);
            
            setTimeout(() => {
                hideProgress();
                showToast(`✅ ${platform} video ready!`, "success");
                
                if (data.title) {
                    downloadMessage.textContent = `"${data.title}" ready to download`;
                }
                
                if (data.filename) {
                    // ✅ Direct download link (no proxy needed for GET)
                    const downloadUrl = `${BACKEND_URL}/get_file/${data.filename}`;
                    downloadLink.href = downloadUrl;
                    downloadLink.download = `${data.title || 'video'}.mp4`;
                    downloadLink.style.display = "inline-block";
                    downloadInfo.style.display = "block";
                    
                    // Auto click
                    setTimeout(() => {
                        downloadLink.click();
                    }, 1500);
                }
                
                input.value = "";
                
            }, 1000);
            
        } else {
            throw new Error(data.error || "Download failed");
        }
        
    } catch (error) {
        console.error("❌ Download error:", error);
        hideProgress();
        showToast(`Error: ${error.message}`, "error");
        
    } finally {
        setTimeout(() => {
            isDownloading = false;
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        }, 2000);
    }
}
// Reset form
function resetForm() {
    input.value = "";
    input.style.border = "2px solid #ddd";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    button.disabled = false;
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
        input.placeholder = "Paste YouTube/TikTok/Instagram/Facebook URL";
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

// Quick test function
window.quickTest = function() {
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    downloadVideo();
};
