// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Backend URL - Change this according to your hosting
const BACKEND_URL = "https://python22.pythonanywhere.com";

let isDownloading = false;
let currentDownloadUrl = "";

// Toast function - FIXED
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
    }, 50);
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
    input.placeholder = "Paste video URL here";
    progressContainer.style.display = "none";
    downloadInfo.style.display = "none";
    downloadLink.style.display = "none";
    button.disabled = false;
    isDownloading = false;
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
}

// Direct download function (for external links)
function triggerDirectDownload(downloadUrl, filename, platform) {
    try {
        // Create temporary anchor
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || `${platform}_${Date.now()}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showToast(`✅ ${platform} download started!`, "success");
        
        // Show success message
        downloadMessage.textContent = `${platform} video is downloading...`;
        downloadInfo.style.display = "block";
        
        // Reset after 5 seconds
        setTimeout(() => {
            resetForm();
        }, 5000);
        
        return true;
    } catch (error) {
        console.error("Direct download error:", error);
        return false;
    }
}

// Main download function - FIXED
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
        console.log(`🚀 Processing: ${url}`);
        
        // Try backend first
        showToast("Connecting to server...", "info");
        
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url })
        });
        
        completeProgress();
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📦 Server response:", data);
        
        if (data.success) {
            showToast(`✅ ${data.platform || 'Video'} found!`, "success");
            
            if (data.redirect) {
                // For redirect URLs (external services)
                showToast("Opening download page...", "info");
                window.open(data.url, '_blank');
                
                downloadMessage.textContent = `Download page opened for ${data.platform || 'video'}`;
                downloadLink.href = data.url;
                downloadLink.textContent = `Click here if download doesn't start`;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('target', '_blank');
                downloadInfo.style.display = "block";
                
            } else if (data.url) {
                // For direct video URLs
                showToast("Starting download...", "success");
                
                // Try direct download
                const success = triggerDirectDownload(
                    data.url, 
                    `${data.platform || 'video'}_${Date.now()}.mp4`,
                    data.platform || 'Video'
                );
                
                if (!success) {
                    // Fallback: show link
                    downloadMessage.textContent = `Click to download ${data.platform || 'video'}`;
                    downloadLink.href = data.url;
                    downloadLink.textContent = `Download ${data.platform || 'Video'}`;
                    downloadLink.style.display = "inline-block";
                    downloadLink.setAttribute('download', `${data.platform || 'video'}_${Date.now()}.mp4`);
                    downloadInfo.style.display = "block";
                }
                
            } else {
                // If no URL but success
                showToast("Video processed successfully", "success");
                downloadMessage.textContent = "Video is ready!";
                downloadInfo.style.display = "block";
            }
            
            // Auto reset after 10 seconds
            setTimeout(() => {
                if (isDownloading) {
                    resetForm();
                }
            }, 10000);
            
        } else {
            // Server returned error
            throw new Error(data.error || "Server could not process video");
        }
        
    } catch (error) {
        console.error("❌ Main error:", error);
        completeProgress();
        
        // Use fallback external services
        showToast("Using alternative download service...", "info");
        
        let fallbackUrl = "";
        let platform = "Video";
        
        // Determine platform and corresponding download service
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = "YouTube";
            fallbackUrl = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
        } else if (url.includes('tiktok.com')) {
            platform = "TikTok";
            fallbackUrl = `https://snaptik.app/${encodeURIComponent(url)}`;
        } else if (url.includes('instagram.com')) {
            platform = "Instagram";
            fallbackUrl = `https://snapinsta.app/${encodeURIComponent(url)}`;
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            platform = "Facebook";
            fallbackUrl = `https://getfbot.com/${encodeURIComponent(url)}`;
        } else {
            fallbackUrl = `https://savetube.io/${encodeURIComponent(url)}`;
        }
        
        // Show fallback message
        downloadMessage.textContent = `Redirecting to ${platform} download page...`;
        downloadLink.href = fallbackUrl;
        downloadLink.textContent = `Click here to download ${platform} video`;
        downloadLink.style.display = "inline-block";
        downloadLink.setAttribute('target', '_blank');
        downloadInfo.style.display = "block";
        
        // Auto-open after 1 second
        setTimeout(() => {
            window.open(fallbackUrl, '_blank');
            showToast(`Opened ${platform} download page`, "success");
        }, 1000);
        
        // Reset after 8 seconds
        setTimeout(() => {
            resetForm();
        }, 8000);
        
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

// Auto-select text when clicked
input.addEventListener("click", function() {
    this.select();
});

// Handle paste event
input.addEventListener("paste", (e) => {
    setTimeout(() => {
        const pastedText = input.value.trim();
        if (pastedText && (pastedText.includes('youtube') || pastedText.includes('tiktok') || 
            pastedText.includes('instagram') || pastedText.includes('facebook'))) {
            showToast("URL detected! Click Download", "info");
        }
    }, 100);
});

// Initialize on page load
window.addEventListener("load", async () => {
    console.log("🎬 Video Downloader v2.0 Loaded");
    console.log(`🔗 Backend: ${BACKEND_URL}`);
    
    // Set initial UI state
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    input.placeholder = "Paste YouTube, TikTok, Instagram, or Facebook URL";
    input.focus();
    
    // Test backend connection
    try {
        showToast("Checking connection...", "info");
        const response = await fetch(`${BACKEND_URL}/status`, { timeout: 5000 });
        if (response.ok) {
            showToast("✅ Connected to server!", "success");
        } else {
            showToast("⚠️ Using fallback services", "info");
        }
    } catch (error) {
        console.log("Backend not reachable, using external services");
        showToast("Ready! Paste video URL", "success");
    }
    
    // Add example URLs cycling (optional)
    const examples = [
        "https://youtu.be/dQw4w9WgXcQ",
        "https://www.tiktok.com/@example",
        "https://www.instagram.com/reel/example",
        "https://facebook.com/watch/?v=example"
    ];
    
    let exampleIndex = 0;
    setInterval(() => {
        if (!input.value && !isDownloading) {
            input.placeholder = `Example: ${examples[exampleIndex]}`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }
    }, 4000);
});
