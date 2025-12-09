// COMPLETE WORKING VIDEO DOWNLOADER - COPY PASTE THIS
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");

// TOAST FUNCTION
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// MAIN DOWNLOAD FUNCTION
async function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste video URL", "error");
        return;
    }
    
    if (!url.startsWith('http')) {
        showToast("Please enter valid URL", "error");
        return;
    }
    
    // Disable button
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    
    try {
        // YAHAN APNA BACKEND URL DALNA HAI
        // AGAR LOCAL TEST KARNA HAI TO: http://localhost:5000
        // AGAR PythonAnywhere PE HAI TO: https://yourusername.pythonanywhere.com
        const BACKEND_URL = "https://python22.pythonanywhere.com"; // CHANGE THIS
        
        console.log("Sending to backend:", url);
        
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({url: url})
        });
        
        const data = await response.json();
        console.log("Backend response:", data);
        
        if (data.success) {
            // AGAR DIRECT DOWNLOAD URL HAI
            if (data.download_url || data.url) {
                const downloadUrl = data.download_url || data.url;
                
                // Create invisible link and click it
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = data.filename || `video_${Date.now()}.mp4`;
                link.target = '_blank';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showToast("✅ Download started!", "success");
                
            } 
            // AGAR REDIRECT HAI (external service)
            else if (data.redirect_url) {
                // Open external service in new tab
                window.open(data.redirect_url, '_blank');
                showToast("✅ Opening download page...", "success");
            }
        } else {
            showToast("Error: " + (data.error || "Failed to download"), "error");
        }
        
    } catch (error) {
        console.error("Download error:", error);
        
        // IF BACKEND FAILS, USE EXTERNAL SERVICES DIRECTLY
        let externalUrl = "";
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            externalUrl = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
            showToast("Using YouTube downloader...", "info");
        } 
        else if (url.includes('tiktok.com')) {
            externalUrl = `https://snaptik.app/${encodeURIComponent(url)}`;
            showToast("Using TikTok downloader...", "info");
        }
        else if (url.includes('instagram.com')) {
            externalUrl = `https://snapinsta.app/${encodeURIComponent(url)}`;
            showToast("Using Instagram downloader...", "info");
        }
        else if (url.includes('facebook.com')) {
            externalUrl = `https://getfbot.com/${encodeURIComponent(url)}`;
            showToast("Using Facebook downloader...", "info");
        }
        else {
            externalUrl = `https://savetube.io/${encodeURIComponent(url)}`;
            showToast("Using video downloader...", "info");
        }
        
        // Open external service
        window.open(externalUrl, '_blank');
        
    } finally {
        // Reset button
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            input.value = "";
            input.placeholder = "Paste another URL";
        }, 2000);
    }
}

// EVENT LISTENERS
button.addEventListener("click", downloadVideo);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        downloadVideo();
    }
});

// INITIALIZE
window.addEventListener("load", () => {
    console.log("🎬 Video Downloader Ready");
    showToast("Paste any video URL and click Download", "success");
    input.focus();
});
