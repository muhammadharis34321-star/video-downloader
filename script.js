// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ Working backend URL
const BACKEND_URL = "https://python22.pythonanywhere.com";

// ✅ Working CORS proxy (tested)
const CORS_PROXY = "https://api.allorigins.win/get?url=";

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

// Test backend
async function testBackend() {
    try {
        const url = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/test')}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const result = await response.json();
            console.log("✅ Backend:", result);
            return true;
        }
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

// ✅ MAIN DOWNLOAD FUNCTION - WORKING VERSION
async function downloadVideo() {
    if (isDownloading) return;
    
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste video URL", "error");
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast("Enter valid URL (with http://)", "error");
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
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    showProgress(30);
    
    try {
        console.log(`Downloading: ${url}`);
        
        // ✅ Using AllOrigins proxy correctly
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(BACKEND_URL + '/download')}`;
        
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });
        
        showProgress(70);
        
        // Parse response
        const result = await response.json();
        
        // AllOrigins returns {contents: "", status: {}}
        if (result.contents) {
            const data = JSON.parse(result.contents);
            
            if (data.success) {
                showProgress(100);
                
                showToast(`✅ ${platform} video ready!`, "success");
                
                // Show download link
                downloadMessage.textContent = `"${data.title}" ready`;
                
                // Set download link
                if (data.filename) {
                    downloadLink.href = `${BACKEND_URL}/get_file/${data.filename}`;
                    downloadLink.download = data.title ? `${data.title}.mp4` : "video.mp4";
                    downloadLink.style.display = "inline-block";
                    downloadInfo.style.display = "block";
                }
                
                input.placeholder = "Ready! Paste another URL";
                
                setTimeout(() => hideProgress(), 1000);
                setTimeout(() => resetForm(), 15000);
                
            } else {
                throw new Error(data.error || "Download failed");
            }
        } else {
            throw new Error("No response from server");
        }
        
    } catch (error) {
        console.error("Download error:", error);
        hideProgress();
        showToast(`Error: ${error.message}`, "error");
        setTimeout(resetForm, 3000);
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
window.testConnection = testBackend;

window.quickTest = function(url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
    input.value = url;
    downloadVideo();
};
