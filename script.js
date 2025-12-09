// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

let isDownloading = false;

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
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
    }, 50);
}

function completeProgress() {
    progressBar.style.width = "100%";
    setTimeout(() => {
        progressContainer.style.display = "none";
    }, 500);
}

function resetForm() {
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

// YouTube video ID extract
function getYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// TikTok video ID extract
function getTikTokId(url) {
    const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    return match ? match[1] : null;
}

// Instagram video ID extract
function getInstagramId(url) {
    const match = url.match(/instagram\.com\/[p|reel|tv]\/([\w-]+)/);
    return match ? match[1] : null;
}

// Main download function - DIRECT API CALLS
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
    input.placeholder = "Processing...";
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    animateProgress();
    
    try {
        console.log(`🚀 Processing URL: ${url}`);
        
        let downloadUrl = null;
        let videoTitle = "Video";
        let platform = "Unknown";
        
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = "YouTube";
            const videoId = getYouTubeId(url);
            if (videoId) {
                // Using y2mate API
                downloadUrl = `https://y2mate.guru/api/convert/${videoId}`;
                videoTitle = "YouTube Video";
            }
        }
        // TikTok
        else if (url.includes('tiktok.com')) {
            platform = "TikTok";
            // Using tikmate API
            const apiUrl = "https://www.tikwm.com/api/";
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: `url=${encodeURIComponent(url)}`
            });
            
            const data = await response.json();
            if (data.data && data.data.play) {
                downloadUrl = data.data.play;
                videoTitle = data.data.title || "TikTok Video";
            }
        }
        // Instagram
        else if (url.includes('instagram.com')) {
            platform = "Instagram";
            // Using savefrom API
            downloadUrl = `https://api.savefrom.app/api/convert?url=${encodeURIComponent(url)}`;
        }
        // Facebook
        else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            platform = "Facebook";
            // Using fbdown API
            downloadUrl = `https://fbdownloader.net/api/ajaxSearch?url=${encodeURIComponent(url)}`;
        }
        
        if (downloadUrl) {
            completeProgress();
            
            showToast(`✅ ${platform} video ready!`, "success");
            
            // Create download link
            downloadMessage.textContent = `Click to download ${platform} video`;
            downloadLink.href = downloadUrl;
            downloadLink.style.display = "inline-block";
            downloadLink.setAttribute('target', '_blank');
            downloadLink.setAttribute('download', `${platform}_${Date.now()}.mp4`);
            downloadInfo.style.display = "block";
            
            input.placeholder = "Download ready! Paste another URL";
            
            // Auto click download after 2 seconds
            setTimeout(() => {
                downloadLink.click();
            }, 2000);
            
        } else {
            throw new Error(`Unsupported URL or service down`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        completeProgress();
        
        // Fallback method
        showToast("Using alternative method...", "info");
        
        // Try alternative method
        setTimeout(() => {
            try {
                // Direct download via iframe
                const tempFrame = document.createElement('iframe');
                tempFrame.style.display = 'none';
                tempFrame.src = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
                document.body.appendChild(tempFrame);
                
                downloadMessage.textContent = "Redirecting to download page...";
                downloadLink.href = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('target', '_blank');
                downloadInfo.style.display = "block";
                
                showToast("Redirecting to download page", "success");
                
            } catch (fallbackError) {
                showToast("Failed to download. Try savetube.io", "error");
                downloadMessage.textContent = "Try: savetube.io";
                downloadLink.href = `https://savetube.io/${encodeURIComponent(url)}`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('target', '_blank');
                downloadInfo.style.display = "block";
            }
            
            setTimeout(() => {
                resetForm();
            }, 10000);
        }, 2000);
        
    } finally {
        setTimeout(() => {
            isDownloading = false;
        }, 3000);
    }
}

// Event Listeners
button.addEventListener("click", downloadVideo);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !isDownloading) {
        downloadVideo();
    }
});

// Add copy button functionality
input.addEventListener('focus', function() {
    this.select();
});

// Add paste listener
input.addEventListener('paste', (e) => {
    setTimeout(() => {
        if (input.value.trim()) {
            showToast("URL pasted! Click Download", "info");
        }
    }, 100);
});

// Initialize
window.addEventListener("load", () => {
    console.log("🚀 Video Downloader Ready");
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    input.placeholder = "Paste video URL and click Download";
    
    // Add sample URLs for testing
    input.value = "";
    input.focus();
    
    showToast("Welcome! Paste any video URL", "success");
});

// Add help tooltip
input.setAttribute('title', 'Paste TikTok, YouTube, Instagram, or Facebook URL');
