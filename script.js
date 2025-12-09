// Simple Direct Video Downloader
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");

// Toast function
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// Get YouTube video ID
function getYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Get TikTok video ID
function getTikTokId(url) {
    const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    return match ? match[1] : null;
}

// Main download function
async function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste video URL", "error");
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    
    try {
        // Send to backend
        const response = await fetch("https://your-backend.com/download", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({url: url})
        });
        
        const data = await response.json();
        
        if (data.success && data.download_url) {
            // Create direct download link
            const link = document.createElement('a');
            link.href = data.download_url;
            link.download = data.filename || "video.mp4";
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast("✅ Download started!", "success");
        } else {
            showToast("Download failed: " + (data.error || "Unknown error"), "error");
        }
        
    } catch (error) {
        showToast("Connection error. Try again.", "error");
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        input.value = "";
    }
}

// Event listeners
button.addEventListener("click", downloadVideo);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") downloadVideo();
});

// Initialize
window.addEventListener("load", () => {
    console.log("✅ Video Downloader Ready");
    showToast("Paste video URL and click Download", "success");
});
