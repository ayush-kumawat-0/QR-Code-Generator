const body = document.body;

const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const logoInput = document.getElementById("logoInput");
const qrPaper = document.getElementById("qrPaper");


const logoPreview = document.getElementById("logoPreview");
const logoName = document.getElementById("logoName");
const removeLogo = document.getElementById("removeLogo");

logoInput.addEventListener("change", () => {
    const file = logoInput.files[0];

    if (file) {
        logoName.textContent = file.name;
        logoPreview.style.display = "flex";
    } else {
        logoPreview.style.display = "none";
        logoName.textContent = "";
    }
});

removeLogo.addEventListener("click", () => {
    logoInput.value = "";
    logoName.textContent = "";
    logoPreview.style.display = "none";
});

function applyTheme(theme) {
    const dark = theme === "dark";
    body.classList.toggle("dark", dark);
    themeIcon.textContent = dark ? "☀" : "☾";
    themeLabel.textContent = dark ? "Light" : "Dark";
    localStorage.setItem("qr-theme", theme);
}

applyTheme(localStorage.getItem("qr-theme") || "light");

themeBtn.addEventListener("click", () => {
    applyTheme(body.classList.contains("dark") ? "light" : "dark");
});

// const formData = new FormData();

// formData.append("content", content);
// formData.append("foreground", foreground);
// formData.append("background", background);
// formData.append("dot_style", dotStyle);

// if (logoFile) {
//     formData.append("logo", logoFile);
// }

// fetch("/generate", {
//     method: "POST",
//     body: formData
// });

/* CONTENT TYPES */

let currentMode = "url";
let currentPayload = "";
let currentQRImage = "";
// let selectedLogo = "none";

document.querySelectorAll(".type-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        currentMode = button.dataset.mode;

        document.querySelectorAll(".mode").forEach(mode => mode.classList.remove("active"));
        document.getElementById(currentMode + "Mode").classList.add("active");
    });
});

/* URL */

const urlInput = document.getElementById("urlInput");
const urlCount = document.getElementById("urlCount");

urlInput.addEventListener("input", () => {
    urlCount.textContent = urlInput.value.length;
});

function normaliseUrl(value) {
    value = value.trim();

    if (!value) return "";

    // The UI no longer hard-codes a protocol.
    // If the user enters example.com, Python receives https://example.com.
    if (!/^https?:\/\//i.test(value)) {
        value = "https://" + value;
    }

    try {
        new URL(value);
        return value;
    } catch {
        return "";
    }
}

/* PAYLOAD */

function setPayload(payload, title) {
    currentPayload = payload;

    document.getElementById("payloadText").textContent =
        payload || "—";

    document.getElementById("previewTitle").textContent =
        title || "Ready to generate";

    document.getElementById("previewText").textContent =
        "Connect this button to your Python QR generator.";

    showToast("Content ready");
}

/* GENERATE BUTTONS */







document.getElementById("generateBtn").addEventListener("click", async () => {

    const url = normaliseUrl(urlInput.value);

    if (!url) {
        showToast("Enter a valid website URL");
        return;
    }

    try {
        const formData = new FormData();

        formData.append("content", url);
        formData.append("foreground", fgColor.value);
        formData.append("background", bgColor.value);
        formData.append("dot_style", document.getElementById("dotStyle").value);

        const logoFile = logoInput.files[0];

        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const response = await fetch("/generate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("QR generation failed");
        }

        const imageBlob = await response.blob();

        const imageUrl = URL.createObjectURL(imageBlob);

        qrPaper.innerHTML = `
            <img
                src="${imageUrl}"
                alt="Generated QR Code"
                id="generatedQR"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                "
            >
        `;

        // Update encoded content
        setPayload(url, "Website QR");

        // Update preview text
        document.getElementById("previewTitle").textContent = "QR Code Ready";
        document.getElementById("previewText").textContent =
            "Scan this QR code to open the website.";

        saveHistory(url, "Website");

        // Store image URL for download/copy
        currentQRImage = imageUrl;

        showToast("QR generated successfully");

    } catch (error) {
        console.error(error);
        showToast("Failed to generate QR");
    }
});





document.getElementById("generateWhatsappBtn").addEventListener("click", async () => {

    const number = phoneInput.value;

    if (number.length !== 10) {
        showToast("Enter a valid 10-digit WhatsApp number");
        return;
    }

    const phone = "91" + number;

    const message = encodeURIComponent(
        document.getElementById("messageInput").value.trim()
    );

    const payload =
        "https://wa.me/" +
        phone.replace(/\D/g, "") +
        (message ? "?text=" + message : "");

    try {

        // const response = await fetch("/generate", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         content: payload,
        //         foreground: fgColor.value,
        //         background: bgColor.value,
        //         dot_style: document.getElementById("dotStyle").value,
        //         logo: selectedLogo
        //     })
        // });


        const formData = new FormData();

        formData.append("content", payload);
        formData.append("foreground", fgColor.value);
        formData.append("background", bgColor.value);
        formData.append("dot_style", document.getElementById("dotStyle").value);

        const logoFile = logoInput.files[0];

        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const response = await fetch("/generate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("QR generation failed");
        }

        const imageBlob = await response.blob();

        const imageUrl = URL.createObjectURL(imageBlob);

        qrPaper.innerHTML = `
            <img
                src="${imageUrl}"
                alt="Generated WhatsApp QR Code"
                id="generatedQR"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                    margin: 0 auto;
                "
            >
        `;

        currentQRImage = imageUrl;

        setPayload(payload, "WhatsApp QR");

        document.getElementById("previewTitle").textContent =
            "WhatsApp QR Ready";

        document.getElementById("previewText").textContent =
            "Scan this QR code to open the WhatsApp conversation.";

        saveHistory(payload, "WhatsApp");

        showToast("WhatsApp QR generated");

    } catch (error) {

        console.error(error);
        showToast("Failed to generate QR");
    }
});




document.getElementById("generateTextBtn").addEventListener("click", async () => {

    console.log("TEXT BUTTON CLICKED");

    const text = document.getElementById("textInput").value.trim();

    console.log("TEXT:", text);

    if (!text) {
        showToast("Enter some text first");
        return;
    }

    try {

        const formData = new FormData();

        formData.append("content", text);
        formData.append("foreground", fgColor.value);
        formData.append("background", bgColor.value);
        formData.append("dot_style", document.getElementById("dotStyle").value);

        const logoFile = logoInput.files[0];

        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const response = await fetch("/generate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("QR generation failed");
        }

        const imageBlob = await response.blob();

        const imageUrl = URL.createObjectURL(imageBlob);

        qrPaper.innerHTML = `
            <img
                src="${imageUrl}"
                alt="Generated Text QR Code"
                id="generatedQR"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                "
            >
        `;

        currentQRImage = imageUrl;

        setPayload(text, "Text QR");

        document.getElementById("previewTitle").textContent =
            "Text QR Ready";

        document.getElementById("previewText").textContent =
            "Scan this QR code to read the encoded text.";

        saveHistory(text, "Text");

        showToast("Text QR generated");

    } catch (error) {

        console.error(error);
        showToast("Failed to generate QR");

    }

});







document.getElementById("downloadBtn").addEventListener("click", () => {

    if (!currentQRImage) {
        showToast("Generate a QR code first");
        return;
    }

    const link = document.createElement("a");

    link.href = currentQRImage;
    link.download = "qr-code.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("QR downloaded");
});


document.getElementById("copyImageBtn").addEventListener("click", async () => {

    if (!currentQRImage) {
        showToast("Generate a QR code first");
        return;
    }

    try {

        const response = await fetch(currentQRImage);
        const blob = await response.blob();

        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);

        showToast("QR image copied");

    } catch (error) {
        console.error(error);
        showToast("Copy image failed");
    }
});





const phoneInput = document.getElementById("phoneInput");

phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value
        .replace(/\D/g, "")
        .slice(0, 10);
});



document.getElementById("pasteBtn").addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();

        if (text) {
            urlInput.value = text;
            urlCount.textContent = text.length;
            showToast("URL pasted");
        }
    } catch {
        showToast("Use Ctrl + V to paste");
    }
});

/* CUSTOMIZATION */

document.getElementById("customizeHead").addEventListener("click", () => {
    document.getElementById("customize").classList.toggle("open");
});

const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");

fgColor.addEventListener("input", () => {
    document.getElementById("fgHex").textContent = fgColor.value.toUpperCase();
});

bgColor.addEventListener("input", () => {
    document.getElementById("bgHex").textContent = bgColor.value.toUpperCase();
});

/* COPY */

document.getElementById("copyPayload").addEventListener("click", async () => {
    if (!currentPayload) {
        showToast("Nothing to copy");
        return;
    }

    try {
        await navigator.clipboard.writeText(currentPayload);
        showToast("Content copied");
    } catch {
        showToast("Copy failed");
    }
});

/* HISTORY */

let history = JSON.parse(localStorage.getItem("qr-history") || "[]");

function saveHistory(payload, type) {
    history = history.filter(item => item.payload !== payload);

    history.unshift({
        payload,
        type,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    history = history.slice(0, 12);

    localStorage.setItem("qr-history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("historyList");

    if (!history.length) {
        list.innerHTML =
            '<div class="subtitle" style="text-align:center;margin-top:30px">No recent QR codes.</div>';
        return;
    }

    list.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <small>${item.type} · ${item.time}</small>
            <div>${escapeHtml(item.payload)}</div>
        </div>
    `).join("");
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

renderHistory();

document.getElementById("historyBtn").addEventListener("click", () => {
    document.getElementById("historyPanel").classList.add("open");
});

document.getElementById("closeHistory").addEventListener("click", () => {
    document.getElementById("historyPanel").classList.remove("open");
});

document.getElementById("clearHistory").addEventListener("click", () => {
    history = [];
    localStorage.removeItem("qr-history");
    renderHistory();
    showToast("History cleared");
});

/* TOAST */

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}


setTimeout(function() {
    location.reload();
}, 900000);