document.getElementById("start-detection").addEventListener("click", async () => {
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  status.textContent = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector_model/');
  await faceapi.nets.ageGenderNet.loadFromUri('models/age_gender_model/');

  let mediaStream = null; // Initialize the mediaStream variable

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = "block";
    status.textContent = "Detecting age...";
    mediaStream = stream; // Store the mediaStream
  } catch (e) {
    status.textContent = "Camera access denied.";
    return;
  }

  setTimeout(async () => {
    const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();
    if (!result) {
      status.textContent = "Face not detected. Try again.";
      stopCamera(mediaStream); // Stop the camera if no face is detected
      return;
    }

    const age = result.age;
    const isChild = age < 18;
    chrome.storage.local.set({ ageGuardUserType: isChild ? "child" : "adult" });

    status.textContent = isChild
      ? `Access Blocked: You are under 18! (Detected Age: ${Math.round(age)})`
      : `Access Granted: You are an adult. (Detected Age: ${Math.round(age)})`;

    // Update the status immediately
    const detectionStatus = document.getElementById("detection-status");
    if (isChild) {
      detectionStatus.textContent = "⚠ Current Status: CHILD (Blocked)";
      detectionStatus.style.color = "red";
    } else {
      detectionStatus.textContent = "✅ Current Status: ADULT (Allowed)";
      detectionStatus.style.color = "green";
    }

    stopCamera(mediaStream); // Stop the camera after detection
  }, 3000);
});

// Function to stop the camera feed
function stopCamera(mediaStream) {
  if (mediaStream) {
    let tracks = mediaStream.getTracks();
    tracks.forEach(track => track.stop()); // Stop all tracks in the media stream
    video.style.display = "none"; // Hide the video element
  }
}

document.getElementById("reset").addEventListener("click", () => {
  chrome.storage.local.remove("ageGuardUserType", () => {
    document.getElementById("status").textContent = "Detection reset. Please re-run.";
    // Reset the detection status UI
    const detectionStatus = document.getElementById("detection-status");
    detectionStatus.textContent = "🕵️ No Detection Done Yet.";
    detectionStatus.style.color = "orange";
  });
});

// Show current status on load
chrome.storage.local.get("ageGuardUserType", (data) => {
  const detectionStatus = document.getElementById("detection-status");

  if (data.ageGuardUserType === "child") {
    detectionStatus.textContent = "⚠ Current Status: CHILD (Blocked)";
    detectionStatus.style.color = "red";
  } else if (data.ageGuardUserType === "adult") {
    detectionStatus.textContent = "✅ Current Status: ADULT (Allowed)";
    detectionStatus.style.color = "green";
  } else {
    detectionStatus.textContent = "🕵️ No Detection Done Yet.";
    detectionStatus.style.color = "orange";
  }
});

// Save Parent Password
// Toggle Change Password Section Visibility
document.getElementById("changePwdBtnToggle").addEventListener("click", () => {
  const changePwdSection = document.getElementById("changePwdSection");
  changePwdSection.style.display = (changePwdSection.style.display === "none" || changePwdSection.style.display === "") ? "block" : "none";
});

// Handle password change functionality
document.getElementById("changePwdBtn").addEventListener("click", () => {
  const oldPwdInput = document.getElementById("oldPwd").value.trim();
  const newPwdInput = document.getElementById("newPwd").value.trim();
  const msg = document.getElementById("changePwdMsg");

  if (!oldPwdInput || !newPwdInput) {
    msg.textContent = "⚠ Please fill in both fields.";
    msg.style.color = "orange";
    return;
  }

  chrome.storage.local.get(["ageGuardPwd"], (res) => {
    const currentPwd = res.ageGuardPwd || "letmein123";

    if (oldPwdInput === currentPwd) {
      chrome.storage.local.set({ ageGuardPwd: newPwdInput }, () => {
        msg.textContent = "✅ Password changed successfully!";
        msg.style.color = "lightgreen";
        document.getElementById("oldPwd").value = "";
        document.getElementById("newPwd").value = "";
      });
    } else {
      msg.textContent = "❌ Old password is incorrect!";
      msg.style.color = "red";
    }
  });
});
