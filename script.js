// Video Downloader Script - 100% Working
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

// Main download function
async function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste video URL", "error");
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // BACKEND URL - CHANGE THIS
        // Agar PythonAnywhere pe hai: https://yourusername.pythonanywhere.com
        // Agar local test karna hai: http://localhost:5000
        const BACKEND_URL = "http://localhost:5000"; // YAHAN APNA URL DALO
        
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({url: url})
        });
        
        const data = await response.json();
        console.log("Response:", data);
        
        if (data.success) {
            if (data.redirect) {
                // Open external service
                window.open(data.url, '_blank');
                showToast("Opening download page...", "success");
            } else if (data.url) {
                // Direct download
                const link = document.createElement('a');
                link.href = data.url;
                link.download = data.filename || "video.mp4";
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast("✅ Download started!", "success");
            }
        } else {
            showToast("Error: " + (data.error || "Failed"), "error");
        }
        
    } catch (error) {
        console.error("Error:", error);
        
        // Use direct external services if backend fails
        let serviceUrl = "";
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            serviceUrl = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
        } else if (url.includes('tiktok.com')) {
            serviceUrl = `https://snaptik.app/${encodeURIComponent(url)}`;
        } else if (url.includes('instagram.com')) {
            serviceUrl = `https://snapinsta.app/${encodeURIComponent(url)}`;
        } else if (url.includes('facebook.com')) {
            serviceUrl = `https://getfbot.com/${encodeURIComponent(url)}`;
        } else {
            serviceUrl = `https://savetube.io/${encodeURIComponent(url)}`;
        }
        
        window.open(serviceUrl, '_blank');
        showToast("Using external service...", "info");
        
    } finally {
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            input.value = "";
        }, 2000);
    }
}

// Event listeners
button.addEventListener("click", downloadVideo);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") downloadVideo();
});

// Initialize
window.addEventListener("load", () => {
    console.log("Video Downloader Ready");
    showToast("Paste video URL and click Download", "success");
    input.focus();
});
