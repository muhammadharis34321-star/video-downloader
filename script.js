// Elements
const input = document.querySelector(".hero-input");
const button = document.getElementById("download-btn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const downloadInfo = document.getElementById("downloadInfo");
const downloadMessage = document.getElementById("downloadMessage");
const downloadLink = document.getElementById("downloadLink");

// ✅ TUMHARA BACKEND
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
        
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ url: url })
        });
        
        completeProgress();
        
        const data = await response.json();
        console.log("📦 Backend response:", data);
        
        if (data.success) {
            showToast(`✅ ${data.platform} video ready!`, "success");
            
            downloadMessage.textContent = `${data.platform} video ready to download`;
            downloadLink.href = `${BACKEND_URL}/get_file/${encodeURIComponent(data.filename)}`;
            downloadLink.style.display = "inline-block";
            downloadLink.setAttribute('download', data.filename);
            downloadLink.setAttribute('target', '_blank');
            downloadInfo.style.display = "block";
            
            input.placeholder = "Download ready! Paste another URL";
            
            setTimeout(() => {
                if (isDownloading) {
                    resetForm();
                }
            }, 15000);
            
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
        
        setTimeout(() => {
            resetForm();
        }, 5000);
        
    } finally {
        isDownloading = false;
    }
}

// Event Listeners
button.addEventListener("click", downloadVideo);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !isDownloading) {
        downloadVideo();
    }
});

// Initialize
window.addEventListener("load", async () => {
    console.log("🚀 Video Downloader initialized");
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/test`);
        const data = await response.json();
        
        if (data.success) {
            console.log("✅ Backend connected");
            button.innerHTML = '<i class="fas fa-download"></i> Download Video';
            input.placeholder = "Paste video URL and click Download";
        }
    } catch (error) {
        console.log("⚠️ Backend check failed");
    }
});
