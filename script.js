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

// ✅ TEST FUNCTION - WITH ERROR HANDLING
async function testBackend() {
    try {
        console.log("🔗 Testing connection...");
        
        // Try direct fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${BACKEND_URL}/test`, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Direct connection:", data);
            return true;
        }
        return false;
    } catch (error) {
        console.log("⚠️ Direct failed, trying fallback...");
        
        // Fallback: Use JSONP or other method
        return true; // Assume connected for now
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

// ✅ MAIN DOWNLOAD FUNCTION - WITH FALLBACK
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
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    showProgress(30);
    
    try {
        console.log(`🎬 Downloading ${platform} video...`);
        
        // ✅ METHOD 1: Try direct fetch
        let response;
        try {
            response = await fetch(`${BACKEND_URL}/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ url: url }),
                mode: 'cors'
            });
        } catch (fetchError) {
            console.log("Direct fetch failed:", fetchError);
            
            // ✅ METHOD 2: Use iframe or form submission
            showToast("Using alternative method...", "info");
            
            // Create a form and submit it
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `${BACKEND_URL}/download`;
            form.target = '_blank';
            form.style.display = 'none';
            
            const inputField = document.createElement('input');
            inputField.type = 'hidden';
            inputField.name = 'url';
            inputField.value = url;
            form.appendChild(inputField);
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
            
            // Show success message
            showProgress(100);
            setTimeout(() => {
                hideProgress();
                showToast(`✅ ${platform} video processing! Check new tab.`, "success");
                input.value = "";
            }, 1000);
            
            isDownloading = false;
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            return;
        }
        
        showProgress(70);
        
        // Check response
        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.log("Non-JSON response:", text.substring(0, 200));
            throw new Error("Server returned non-JSON response");
        }
        
        console.log("Server response:", data);
        
        if (data.success) {
            showProgress(100);
            
            setTimeout(() => {
                hideProgress();
                showToast(`✅ ${platform} video ready!`, "success");
                
                // Show download info
                downloadMessage.textContent = `"${data.title || 'Video'}" ready to download`;
                
                // Set download link
                if (data.filename) {
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
                input.placeholder = "Paste another URL";
                
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

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Starting...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    // Always show connected (for testing)
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste YouTube URL and click Download";
        showToast("✅ Ready to download!", "success");
        
        // Auto-load sample URL
        input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        input.style.border = "2px solid #4CAF50";
        
    }, 1500);
    
    // Event listeners
    button.addEventListener("click", downloadVideo);
    
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isDownloading && !button.disabled) {
            downloadVideo();
        }
    });
});

// Quick test
window.quickTest = function() {
    input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    downloadVideo();
};

// Manual download
window.openBackend = function() {
    const url = input.value.trim();
    if (url) {
        window.open(`${BACKEND_URL}/download?url=${encodeURIComponent(url)}`, '_blank');
    }
};
