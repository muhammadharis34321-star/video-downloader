// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Backend URL
const BACKEND_URL = "https://python22.pythonanywhere.com";

let isDownloading = false;

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// Progress bar
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
    }, 30);
}

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
    input.value = "";
    input.placeholder = "Paste another video URL";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    downloadLink.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Direct download function
function startDirectDownload(downloadUrl, filename, platform) {
    try {
        // Create invisible iframe for download
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        document.body.appendChild(iframe);
        
        // Also create direct link as backup
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || `${platform}_${Date.now()}.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    } catch (error) {
        console.error("Direct download failed:", error);
        return false;
    }
}

// Main download function
async function downloadVideo() {
    if (isDownloading) return;
    
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste a video URL first", "error");
        input.focus();
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showToast("Please enter a valid URL", "error");
        return;
    }
    
    isDownloading = true;
    
    input.style.border = "2px solid #4CAF50";
    input.style.color = "#4CAF50";
    input.placeholder = "Getting video...";
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Video...';
    
    animateProgress();
    
    try {
        console.log(`📤 Sending: ${url}`);
        
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📥 Response:", data);
        
        completeProgress();
        
        if (data.success) {
            showToast(`✅ ${data.platform} video found!`, "success");
            
            if (data.redirect) {
                // Open external download page
                showToast(`Opening ${data.platform} download page...`, "info");
                
                // Open in new tab
                window.open(data.url, '_blank');
                
                // Show message
                downloadMessage.textContent = `${data.platform} download page opened`;
                downloadLink.href = data.url;
                downloadLink.textContent = `Click here if page didn't open`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('target', '_blank');
                downloadInfo.style.display = "block";
                
                setTimeout(() => {
                    resetForm();
                }, 3000);
                
            } else if (data.url) {
                // Direct video URL - try to download
                showToast(`Downloading ${data.platform} video...`, "success");
                
                // Try to trigger download
                const downloaded = startDirectDownload(
                    data.url,
                    `${data.platform}_${Date.now()}.mp4`,
                    data.platform
                );
                
                if (downloaded) {
                    downloadMessage.textContent = `${data.platform} download started`;
                    downloadInfo.style.display = "block";
                } else {
                    // Fallback: show link
                    downloadMessage.textContent = `Click to download ${data.platform} video`;
                    downloadLink.href = data.url;
                    downloadLink.textContent = `Download ${data.platform} Video`;
                    downloadLink.style.display = "inline-block";
                    downloadLink.setAttribute('target', '_blank');
                    downloadInfo.style.display = "block";
                }
                
                setTimeout(() => {
                    resetForm();
                }, 5000);
                
            } else {
                showToast("Video processed successfully", "success");
                setTimeout(() => resetForm(), 2000);
            }
            
        } else {
            throw new Error(data.error || "Failed to get video");
        }
        
    } catch (error) {
        console.error("❌ Main error:", error);
        completeProgress();
        
        // USE EXTERNAL SERVICES DIRECTLY
        showToast("Using external service...", "info");
        
        let serviceUrl = "";
        let platform = "Video";
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = "YouTube";
            serviceUrl = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
        } else if (url.includes('tiktok.com')) {
            platform = "TikTok";
            serviceUrl = `https://snaptik.app/${encodeURIComponent(url)}`;
        } else if (url.includes('instagram.com')) {
            platform = "Instagram";
            serviceUrl = `https://snapinsta.app/${encodeURIComponent(url)}`;
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            platform = "Facebook";
            serviceUrl = `https://getfbot.com/${encodeURIComponent(url)}`;
        } else {
            serviceUrl = `https://savetube.io/${encodeURIComponent(url)}`;
        }
        
        // Open immediately
        window.open(serviceUrl, '_blank');
        
        // Show status
        downloadMessage.textContent = `${platform} download page opened`;
        downloadLink.href = serviceUrl;
        downloadLink.textContent = `Click here to open again`;
        downloadLink.style.display = "inline-block";
        downloadLink.setAttribute('target', '_blank');
        downloadInfo.style.display = "block";
        
        showToast(`✅ ${platform} page opened!`, "success");
        
        setTimeout(() => {
            resetForm();
        }, 4000);
        
    } finally {
        setTimeout(() => {
            isDownloading = false;
        }, 2000);
    }
}

// Event Listeners
button.addEventListener("click", downloadVideo);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !isDownloading) {
        downloadVideo();
    }
});

// Auto-select text
input.addEventListener("focus", function() {
    this.select();
});

// Initialize
window.addEventListener("load", () => {
    console.log("🎬 Video Downloader v3.0 - 100% Working");
    console.log(`🔗 Backend: ${BACKEND_URL}`);
    
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    input.placeholder = "Paste YouTube, TikTok, Instagram, or Facebook URL";
    input.focus();
    
    // Test backend
    fetch(`${BACKEND_URL}/status`)
        .then(res => {
            if (res.ok) {
                showToast("✅ Connected to server!", "success");
            } else {
                showToast("⚠️ Will use external services", "info");
            }
        })
        .catch(() => {
            showToast("Ready! Paste video URL", "success");
        });
});
