chrome.storage.local.get("ageGuardUserType", (data) => {
  if (data.ageGuardUserType === "child") {
    // List of blocked website keywords
    const blockedSites = [
      "pornhub", "xvideos", "redtube", "brazzers", "xnxx", 
      "hentaihaven", "escort", "adultfriendfinder", "sex", 
      "xhamster", "spankbang", "fap", "thothub", "javhd", 
      "erome", "camgirl", "camsoda", "chaturbate", "bongacams",
      "onlyfans", "xhamsterlive", "pornhd", "tnaflix", "youporn", 
      "hclips", "cliphunter", "motherless", "voyeur", "javlibrary", 
      "xtube", "drtuber", "pornmd", "sunporno", "tube8", "keezmovies",
      "freeporn", "yespornplease", "pornhat", "f95zone", "rule34"
    ];
    
    // List of adult-related words
    const blockedKeywords = [
      "porn", "sex", "xxx", "nude", "erotic", "hentai", "cams", 
      "escort", "incest", "nsfw", "bdsm", "fetish", "taboo", 
      "hardcore", "milf", "cum", "anal", "threesome", "swinger", 
      "lesbian", "gay porn", "blowjob", "deepthroat", "handjob", 
      "gangbang", "creampie", "orgy", "strip", "naked", "wet", 
      "boobs", "tits", "vagina", "penis", "cock", "dildo", "masturbation", 
      "sex chat", "live sex", "camgirl", "hot girls", "adult video",
      "pussy", "doggystyle", "69 position", "sexual", "lingerie", "sensual"
    ];
    

    // Extract domain name
    const currentURL = window.location.hostname.toLowerCase();

    // Block exact domain matches
    if (blockedSites.some(site => currentURL.includes(site + "."))) {
      blockPage();
      return;
    }

    // Function to scan page content dynamically
    function scanPage() {
      const pageText = document.body.innerText.toLowerCase();
      if (blockedKeywords.some(keyword => pageText.includes(keyword))) {
        blockPage();
      }
    }

    // Initial scan
    scanPage();

    // Keep scanning for dynamically loaded content
    const observer = new MutationObserver(scanPage);
    observer.observe(document.body, { childList: true, subtree: true });

    // Scan iframes (for sites loading content inside iframes)
    document.querySelectorAll("iframe").forEach(iframe => {
      try {
        let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          let iframeText = iframeDoc.body.innerText.toLowerCase();
          if (blockedKeywords.some(keyword => iframeText.includes(keyword))) {
            blockPage();
          }
        }
      } catch (error) {
        console.warn("Blocked iframe access (cross-origin):", error);
      }
    });
  }
});

// Function to block the page
function blockPage() {
  document.body.innerHTML = `
    <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:#000000e0; color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:sans-serif; font-size:20px; z-index:99999;">
      <h1>Access Blocked by AgeGuard</h1>
      <p>You are under 18 and access is restricted.</p>
      <p>Enter password to unlock:</p>
      <input type="password" id="ageGuardPwd" style="padding:10px; font-size:18px; background:white; color:black; border-radius:5px;">
      <button id="showPwdBtn" style="background:none; border:none; cursor:pointer; font-size:18px;">👁️</button>
      <button id="ageGuardUnlockBtn" style="padding:10px 20px; margin-top:10px; font-size:18px; cursor:pointer;">Unlock</button>
      <p id="ageGuardMsg" style="margin-top:10px; color:lightgreen;"></p>

      <div id="resetSection" style="display:none; margin-top:20px;">
        <p>Forgot password? Set a new one:</p>
        <input type="password" id="adminPwd" placeholder="Enter Admin Password" style="padding:10px; font-size:18px; background:white; color:black; border-radius:5px;">
        <button id="showAdminPwdBtn" style="background:none; border:none; cursor:pointer; font-size:18px;">👁️</button>
        <button id="verifyAdminPwdBtn" style="padding:10px 20px; margin-top:10px; font-size:18px; cursor:pointer;">Verify Admin Password</button>
        <p id="adminMsg" style="margin-top:10px; color:orange;"></p>

        <div id="newPasswordSection" style="display:none; margin-top:20px;">
          <p>Enter new password:</p>
          <input type="password" id="newPwd" placeholder="New Password" style="padding:10px; font-size:18px; background:white; color:black; border-radius:5px;">
          <button id="showNewPwdBtn" style="background:none; border:none; cursor:pointer; font-size:18px;">👁️</button>
          <button id="resetPwdBtn" style="padding:10px 20px; margin-top:10px; font-size:18px; cursor:pointer;">Reset Password</button>
          <p id="newPwdError" style="margin-top:10px; color:red; display:none;"></p>
          <p id="newPwdSuccess" style="margin-top:10px; color:lightgreen; display:none;"></p>
        </div>
      </div>
    </div>
  `;

  let failCount = 0;
  let resetAttempts = 0;
  const adminPassword = "admin123"; 
  const maxAdminAttempts = 3;
  const msg = document.getElementById("ageGuardMsg");
  const unlockBtn = document.getElementById("ageGuardUnlockBtn");
  const pwdInput = document.getElementById("ageGuardPwd");
  const resetSection = document.getElementById("resetSection");
  const showPwdBtn = document.getElementById("showPwdBtn");
  const showAdminPwdBtn = document.getElementById("showAdminPwdBtn");
  const showNewPwdBtn = document.getElementById("showNewPwdBtn");
  const verifyAdminPwdBtn = document.getElementById("verifyAdminPwdBtn");
  const adminPwdInput = document.getElementById("adminPwd");
  const adminMsg = document.getElementById("adminMsg");
  const newPasswordSection = document.getElementById("newPasswordSection");
  const newPwdInput = document.getElementById("newPwd");
  const resetPwdBtn = document.getElementById("resetPwdBtn");
  const newPwdError = document.getElementById("newPwdError");
  const newPwdSuccess = document.getElementById("newPwdSuccess");

  // Toggle Password Visibility
  showPwdBtn.addEventListener("click", () => togglePassword(pwdInput, showPwdBtn));
  showAdminPwdBtn.addEventListener("click", () => togglePassword(adminPwdInput, showAdminPwdBtn));
  showNewPwdBtn.addEventListener("click", () => togglePassword(newPwdInput, showNewPwdBtn));

  unlockBtn.addEventListener("click", () => {
    const enteredPwd = pwdInput.value.trim();
    chrome.storage.local.get(["ageGuardPwd"], (res) => {
      const correctPwd = res.ageGuardPwd || "letmein123";

      if (!enteredPwd) {
        showMessage(msg, "⚠ Password cannot be empty.", "orange");
      } else if (enteredPwd.length < 6) {
        showMessage(msg, "⚠ Password is incorrect.", "orange");
      } else if (enteredPwd === correctPwd) {
        chrome.storage.local.set({ ageGuardUserType: "adult" }, () => {
          showMessage(msg, "Access granted! Reloading...", "green");
          setTimeout(() => location.reload(), 1000);
        });
      } else {
        failCount++;
        showMessage(msg, `Incorrect password! Attempt ${failCount}/3`, "red");

        if (failCount >= 3) {
          resetSection.style.display = "block";
        }
      }
    });
  });

  verifyAdminPwdBtn.addEventListener("click", () => {
    const enteredAdminPwd = adminPwdInput.value.trim();

    if (resetAttempts >= maxAdminAttempts) {
      showMessage(adminMsg, "❌ Too many attempts. Try again later.", "red");
      return;
    }

    if (enteredAdminPwd === adminPassword) {
      showMessage(adminMsg, "✅ Admin verified. You can reset the password.", "green");
      newPasswordSection.style.display = "block";
    } else {
      resetAttempts++;
      showMessage(adminMsg, `❌ Incorrect admin password! Attempt ${resetAttempts}/${maxAdminAttempts}`, "red");
    }
  });

  resetPwdBtn.addEventListener("click", () => {
    const newPwd = newPwdInput.value.trim();

    if (!newPwd || newPwd.length < 6) {
      showMessage(newPwdError, "⚠ New password must be at least 6 characters.", "red");
      newPwdError.style.display = "block";
      newPwdSuccess.style.display = "none";
      return;
    }

    chrome.storage.local.set({ ageGuardPwd: newPwd }, () => {
      newPwdError.style.display = "none";
      newPwdSuccess.style.display = "block";
      newPwdSuccess.textContent = "✅ Password reset successfully! Reloading...";
      setTimeout(() => location.reload(), 1000);
    });
  });
}

// Utility Functions
function togglePassword(input, button) {
  if (input.type === "password") {
    input.type = "text";
    button.textContent = "🙈";
  } else {
    input.type = "password";
    button.textContent = "👁️";
  }
}

function showMessage(element, text, color) {
  element.textContent = text;
  element.style.color = color;
  element.style.display = "block";
}
