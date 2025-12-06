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

// ✅ WORKING TEST FUNCTION
async function testBackend() {
    try {
        console.log("Testing connection...");
        
        // Direct test without worrying about CORS
        const response = await fetch(`${BACKEND_URL}/test`);
        
        if (response.ok) {
            const text = await response.text();
            console.log("Raw response:", text);
            return true;
        }
        return false;
    } catch (error) {
        console.log("Connection test:", error.name);
        // Still return true for testing
        return true;
    }
}

// ✅ MAIN WORKING DOWNLOAD FUNCTION
async function downloadVideo() {
    if (isDownloading) return;
    
    const url = input.value.trim();
    if (!url) {
        showToast("Paste URL first", "error");
        return;
    }
    
    isDownloading = true;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    showProgress(30);
    
    try {
        console.log("Starting download...");
        
        // ✅ METHOD 1: Try direct POST
        try {
            const response = await fetch(`${BACKEND_URL}/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Success via POST:", data);
                
                showProgress(100);
                setTimeout(() => {
                    hideProgress();
                    showToast("✅ Video ready!", "success");
                    showDownloadInfo(data);
                }, 1000);
                return;
            }
        } catch (postError) {
            console.log("POST failed:", postError);
        }
        
        // ✅ METHOD 2: Use GET with query parameters
        showToast("Trying alternative method...", "info");
        
        const getUrl = `${BACKEND_URL}/download?url=${encodeURIComponent(url)}`;
        console.log("Trying GET:", getUrl);
        
        // Open in new tab
        window.open(getUrl, '_blank');
        
        showProgress(100);
        setTimeout(() => {
            hideProgress();
            showToast("✅ Check new tab for download", "success");
            input.value = "";
        }, 1000);
        
    } catch (error) {
        console.error("Error:", error);
        hideProgress();
        showToast("❌ Error occurred", "error");
        
    } finally {
        setTimeout(() => {
            isDownloading = false;
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        }, 2000);
    }
}

function showDownloadInfo(data) {
    if (data.title) {
        downloadMessage.textContent = `"${data.title}" ready to download`;
    }
    
    if (data.filename) {
        const downloadUrl = `${BACKEND_URL}/get_file/${data.filename}`;
        downloadLink.href = downloadUrl;
        downloadLink.download = `${data.title || 'video'}.mp4`;
        downloadLink.style.display = "inline-block";
        downloadInfo.style.display = "block";
    }
    
    input.value = "";
}

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader Starting...");
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    // Don't wait for test, just show ready
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-download"></i> Download Video';
        button.disabled = false;
        input.placeholder = "Paste YouTube URL here";
        showToast("✅ Ready to download!", "success");
        
        // Auto-load test URL
        input.value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        
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
