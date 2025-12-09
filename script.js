// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// Backend URL - Change this to your actual backend URL
// If running locally: http://localhost:5000
// If on PythonAnywhere: https://yourusername.pythonanywhere.com
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
    input.placeholder = "Processing...";
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    animateProgress();
    
    try {
        console.log(`🚀 Sending to backend: ${url}`);
        console.log(`📡 Backend URL: ${BACKEND_URL}`);
        
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url })
        });
        
        completeProgress();
        
        const data = await response.json();
        console.log("📦 Backend response:", data);
        
        if (data.success) {
            showToast(`✅ ${data.platform} video ready!`, "success");
            
            if (data.redirect) {
                // Open external download page
                window.open(data.url, '_blank');
                downloadMessage.textContent = `Opened ${data.platform} download page in new tab`;
                downloadInfo.style.display = "block";
                
                setTimeout(() => {
                    resetForm();
                }, 3000);
            } else {
                // Direct download
                downloadMessage.textContent = `Downloading ${data.platform} video...`;
                downloadLink.href = data.url;
                downloadLink.style.display = "inline-block";
                downloadLink.setAttribute('target', '_blank');
                downloadLink.setAttribute('download', `${data.platform}_${Date.now()}.mp4`);
                downloadInfo.style.display = "block";
                
                // Auto-click after 1 second
                setTimeout(() => {
                    downloadLink.click();
                }, 1000);
                
                setTimeout(() => {
                    resetForm();
                }, 5000);
            }
            
            input.placeholder = "Download ready! Paste another URL";
            
        } else {
            throw new Error(data.error || "Download failed");
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        completeProgress();
        
        let errorMessage = "Download failed. ";
        if (error.message.includes("Failed to fetch")) {
            errorMessage = "Cannot connect to server. Check your internet.";
        } else {
            errorMessage += error.message;
        }
        
        showToast(errorMessage, "error");
        input.placeholder = "Download failed. Try again.";
        input.style.border = "2px solid #f44336";
        
        // Fallback: Use external services
        setTimeout(() => {
            showToast("Trying alternative method...", "info");
            
            let fallbackUrl = "";
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                fallbackUrl = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
            } else if (url.includes('tiktok.com')) {
                fallbackUrl = `https://snaptik.app/${encodeURIComponent(url)}`;
            } else if (url.includes('instagram.com')) {
                fallbackUrl = `https://snapinsta.app/${encodeURIComponent(url)}`;
            } else if (url.includes('facebook.com')) {
                fallbackUrl = `https://getfbot.com/${encodeURIComponent(url)}`;
            } else {
                fallbackUrl = `https://savetube.io/${encodeURIComponent(url)}`;
            }
            
            downloadMessage.textContent = "Redirecting to download page...";
            downloadLink.href = fallbackUrl;
            downloadLink.style.display = "inline-block";
            downloadLink.setAttribute('target', '_blank');
            downloadInfo.style.display = "block";
            
            // Auto open
            setTimeout(() => {
                window.open(fallbackUrl, '_blank');
            }, 1000);
            
            setTimeout(() => {
                resetForm();
            }, 5000);
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

// Auto-select on focus
input.addEventListener("focus", function() {
    this.select();
});

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader initialized");
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    
    // Check backend status
    try {
        const response = await fetch(`${BACKEND_URL}/status`);
        const data = await response.json();
        
        if (data.success) {
            console.log("✅ Backend connected");
            showToast("Video Downloader Ready!", "success");
        }
    } catch (error) {
        console.log("⚠️ Backend check failed, using fallback methods");
        showToast("Using external download services", "info");
    }
    
    button.innerHTML = '<i class="fas fa-download"></i> Download Video';
    input.placeholder = "Paste video URL and click Download";
    
    // Example URLs for testing (optional)
    const examples = [
        "https://youtu.be/rod6AniVIw0",
        "https://www.tiktok.com/@example/video/123456789",
        "https://www.instagram.com/reel/ABC123/",
        "https://www.facebook.com/watch/?v=123456789"
    ];
    
    // Cycle through examples (optional feature)
    let exampleIndex = 0;
    setInterval(() => {
        if (!isDownloading && !input.value) {
            input.placeholder = `Example: ${examples[exampleIndex]}`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }
    }, 3000);
});
