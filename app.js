document.addEventListener("DOMContentLoaded", () => {
  
  // --- CONTACT DATA CONFIG ---
  const contactData = {
    firstName: "Alejandro",
    lastName: "Cepeda",
    fullName: "Alejandro Cepeda",
    title: "Builder",
    organization: "Adepec Homes",
    phone: "+13105550199",
    email: "inquire@adepecgrouphomes.com",
    website: "https://adepecgrouphomes.com"
  };

  // --- DOM ELEMENTS ---
  const btnSave = document.getElementById("btn-save");
  const btnShare = document.getElementById("btn-share");
  const btnCopyLink = document.getElementById("btn-copy-link");
  const qrModal = document.getElementById("qr-modal");
  const qrModalClose = document.getElementById("qr-modal-close");
  const toast = document.getElementById("toast-message");
  const qrCanvas = document.getElementById("qr-canvas");
  const btnThemeToggle = document.getElementById("theme-toggle");

  let qrCodeInstance = null;

  // --- THEME INITIALIZATION & TOGGLE ---
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light") {
    document.body.classList.add("light-theme");
  }

  btnThemeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const activeTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
    localStorage.setItem("theme", activeTheme);
  });

  // --- VCARD GENERATOR & DOWNLOADER ---
  btnSave.addEventListener("click", () => {
    // Generate vCard format text
    const vCardText = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${contactData.lastName};${contactData.firstName};;;`,
      `FN:${contactData.fullName}`,
      `ORG:${contactData.organization}`,
      `TITLE:${contactData.title}`,
      `TEL;TYPE=CELL,VOICE:${contactData.phone}`,
      `EMAIL;TYPE=PREF,INTERNET:${contactData.email}`,
      `URL:${contactData.website}`,
      `REV:${new Date().toISOString()}`,
      "END:VCARD"
    ].join("\r\n");

    // Create Blob from vCard text
    const blob = new Blob([vCardText], { type: "text/vcard;charset=utf-8;" });
    const filename = `${contactData.firstName}_${contactData.lastName}_Adepec_Homes.vcf`;

    // Trigger download
    if (navigator.msSaveBlob) { // IE10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        // Create Object URL for the blob
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast("Contact card downloaded!");
      } else {
        // Fallback for browsers that don't support downloading file Blobs directly
        window.open(encodeURI("data:text/vcard;charset=utf-8," + vCardText));
      }
    }
  });

  // --- SHARE FUNCTIONALITY ---
  btnShare.addEventListener("click", () => {
    const shareTitle = `${contactData.fullName} | ${contactData.organization}`;
    const shareText = `Connect with ${contactData.fullName}, ${contactData.title} at ${contactData.organization}.`;
    const shareUrl = window.location.href;

    // Check if browser supports native Web Share API (mobile Chrome/Safari)
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      })
      .then(() => showToast("Profile shared successfully!"))
      .catch((error) => {
        // If sharing was cancelled, do nothing. If error, open fallback modal.
        if (error.name !== "AbortError") {
          openShareModal(shareUrl);
        }
      });
    } else {
      // Fallback: Open modal with QR Code and Copy Link option
      openShareModal(shareUrl);
    }
  });

  // --- QR MODAL HANDLERS ---
  function openShareModal(url) {
    qrModal.classList.add("active");
    
    // Dynamically generate QR code if it doesn't exist yet
    if (typeof QRious !== "undefined") {
      if (!qrCodeInstance) {
        qrCodeInstance = new QRious({
          element: qrCanvas,
          value: url,
          size: 300,
          background: '#ffffff',
          foreground: '#070707',
          level: 'H'
        });
      } else {
        qrCodeInstance.value = url;
      }
    } else {
      console.error("QRious library not loaded.");
    }
  }

  function closeShareModal() {
    qrModal.classList.remove("active");
  }

  qrModalClose.addEventListener("click", closeShareModal);
  
  // Close modal when clicking outside the modal box
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      closeShareModal();
    }
  });

  // --- CLIPBOARD UTILITY ---
  btnCopyLink.addEventListener("click", () => {
    const profileUrl = window.location.href;
    
    // Copy URL to Clipboard
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        showToast("Profile link copied!");
        closeShareModal();
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        showToast("Failed to copy link.");
      });
  });

  // --- TOAST NOTIFICATION UTILITY ---
  function showToast(message) {
    const toastText = toast.querySelector(".toast-text");
    toastText.textContent = message;
    
    toast.classList.add("show");
    
    // Reset toast state after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Escape key closes modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeShareModal();
    }
  });

});
