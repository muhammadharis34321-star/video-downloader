// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const toast = document.getElementById("toast");

// SIMPLE DIRECT DOWNLOAD - NO BACKEND NEEDED
function downloadVideo() {
    const url = input.value.trim();
    
    if (!url) {
        showToast("Please paste a video URL", "error");
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening...';
    
    // Direct external services
    let downloadUrl = "";
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        downloadUrl = `https://ssyoutube.com/en105DL/${encodeURIComponent(url)}`;
        showToast("Opening YouTube downloader...", "info");
    } 
    else if (url.includes('tiktok.com')) {
        downloadUrl = `https://snaptik.app/${encodeURIComponent(url)}`;
        showToast("Opening TikTok downloader...", "info");
    }
    else if (url.includes('instagram.com')) {
        downloadUrl = `https://snapinsta.app/${encodeURIComponent(url)}`;
        showToast("Opening Instagram downloader...", "info");
    }
    else if (url.includes('facebook.com') || url.includes('fb.watch')) {
        downloadUrl = `https://getfbot.com/${encodeURIComponent(url)}`;
        showToast("Opening Facebook downloader...", "info");
    }
    else {
        downloadUrl = `https://savetube.io/${encodeURIComponent(url)}`;
        showToast("Opening video downloader...", "info");
    }
    
    // Open in new tab
    window.open(downloadUrl, '_blank');
    
    // Reset button
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        input.value = "";
        input.placeholder = "Paste another URL";
        showToast("Download page opened in new tab!", "success");
    }, 2000);
}

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Event Listeners
button.addEventListener("click", downloadVideo);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        downloadVideo();
    }
});

// Initialize
window.addEventListener("load", () => {
    console.log("✅ Simple Video Downloader Ready");
    showToast("Paste any video URL and click Download", "success");
    input.placeholder = "Paste YouTube, TikTok, Instagram, Facebook URL";
    input.focus();
});
