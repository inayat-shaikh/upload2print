document.addEventListener("DOMContentLoaded", function () {
  // Utility functions
  const generateFileId = () =>
    `S${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
  const getFileExtension = (filename) =>
    filename.substring(filename.lastIndexOf("."));
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // DOM elements
  const elements = {
    form: document.getElementById("uploadForm"),
    sections: {
      input: document.getElementById("inputFormSection"),
      uploading: document.getElementById("uploadingSection"),
      success: document.getElementById("success"),
    },
    progress: {
      circle: document.querySelector(".circle-progress"),
      status: document.getElementById("progressStatus"),
    },
    file: {
      input: document.getElementById("fileInputElement"),
      info: document.getElementById("file-info"),
      name: document.getElementById("file-name"),
      size: document.getElementById("file-size"),
      renamed: document.getElementById("renamed-file"),
      id: document.getElementById("file-id"),
    },
    dropzone: {
      container: document.getElementById("dropzone-container"),
      content: document.getElementById("dropzone-content"),
    },
    buttons: {
      upload: document.getElementById("uploadButton"),
      ok: document.getElementById("okButton"),
    },
    inputs: {
      department: document.getElementById("department"),
      subject: document.getElementById("subject"),
      experimentNo: document.getElementById("experimentNo"),
      rollNumber: document.getElementById("rollNumber"),
    },
    docLink: {
      radio: document.getElementById("DocLink"),
      div: document.getElementById("DocLinkDiv"),
      input: document.getElementById("DocLinkInput"),
    },
    fileRadio: document.getElementById("fileInputRadio"),
    pin: {
      toggle: document.getElementById("pinToggle"),
      input: document.getElementById("pinInput"),
      boxes: document.querySelectorAll(".pininputbox"),
    },
  };

  // Constants
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw6AlbgUPkdsul6Xh3asyvOacesyA_W4ghTjMl7j3DFW8S8jd-hbjOp8B-JZE11ZSg/exec";
  const CIRCLE_RADIUS = 65;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Initialize progress circle
  elements.progress.circle.setAttribute("stroke-dasharray", CIRCUMFERENCE);
  elements.progress.circle.setAttribute("stroke-dashoffset", CIRCUMFERENCE);

  // Array to store all dropdown instances
  const dropdownInstances = [];

  // Function to setup custom dropdown with search
  function setupCustomDropdown(
    buttonId,
    menuId,
    searchId,
    optionsId,
    hiddenInputId,
    defaultText
  ) {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    const search = document.getElementById(searchId);
    const optionsContainer = document.getElementById(optionsId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const options = optionsContainer.querySelectorAll(".dropdown-option");

    // Add this dropdown to the instances array
    const dropdownInstance = { menu };
    dropdownInstances.push(dropdownInstance);

    // Function to close all other dropdowns
    function closeOtherDropdowns(currentMenuId) {
      dropdownInstances.forEach((instance) => {
        if (
          instance.menu.id !== currentMenuId &&
          !instance.menu.classList.contains("hidden")
        ) {
          instance.menu.classList.add("hidden");
        }
      });
    }

    // Toggle dropdown visibility and scroll to ensure visibility
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const isOpen = !menu.classList.contains("hidden");
      if (!isOpen) {
        // Close all other dropdowns before opening this one
        closeOtherDropdowns(menuId);
      }
      menu.classList.toggle("hidden");
      if (!menu.classList.contains("hidden")) {
        search.focus();
        // Scroll to make the dropdown fully visible
        menu.scrollIntoView({
          behavior: "smooth",
          block: "nearest", // Align to nearest edge to avoid unnecessary scrolling
          inline: "nearest",
        });
      }
    });

    // Prevent dropdown menu from closing when clicking inside
    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Handle touch events for scrolling within options container
    optionsContainer.addEventListener("touchstart", (e) => {
      e.stopPropagation(); // Allow touchstart for scrolling options
    });

    optionsContainer.addEventListener("touchmove", (e) => {
      e.stopPropagation(); // Allow touchmove for scrolling options
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });

    // Filter options based on search input
    search.addEventListener("input", function () {
      const searchText = this.value.toLowerCase();
      options.forEach((option) => {
        option.style.display = option.textContent
          .toLowerCase()
          .includes(searchText)
          ? ""
          : "none";
      });
    });

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        button.textContent = this.textContent;
        hiddenInput.value = value;
        menu.classList.add("hidden");
        search.value = "";
        options.forEach((opt) => (opt.style.display = ""));
      });
    });

    // Return reset function
    return function resetDropdown() {
      button.textContent = defaultText;
      hiddenInput.value = "";
      search.value = "";
      options.forEach((opt) => (opt.style.display = ""));
      menu.classList.add("hidden");
    };
  }

  // Setup custom dropdowns
  const resetDropdowns = {
    department: setupCustomDropdown(
      "department-button",
      "department-menu",
      "department-search",
      "department-options",
      "department",
      "Select Department & Division"
    ),
    subject: setupCustomDropdown(
      "subject-button",
      "subject-menu",
      "subject-search",
      "subject-options",
      "subject",
      "Select Subject"
    ),
    experiment: setupCustomDropdown(
      "experimentNo-button",
      "experimentNo-menu",
      "experiment-search",
      "experimentNo-options",
      "experimentNo",
      "Select Experiment Number"
    ),
  };

  // Handle file radio button toggle
  function toggleFileInputMode() {
    const isDocLink = elements.docLink.radio.checked;
    elements.docLink.div.style.display = isDocLink ? "flex" : "none";
    elements.dropzone.container.style.display = isDocLink ? "none" : "flex";
  }

  elements.docLink.radio.addEventListener("change", toggleFileInputMode);
  elements.fileRadio.addEventListener("change", toggleFileInputMode);

  // Validate Google Doc link
  elements.docLink.input.addEventListener("input", function () {
    const link = this.value.trim();
    const googleDocRegex =
      /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)\/edit/;
    const match = link.match(googleDocRegex);

    if (match && match[1]) {
      this.className =
        "rounded-none rounded-e-lg bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500 block flex-1 min-w-0 text-base p-2.5";
      elements.form.dataset.googleDocId = match[1];
    } else {
      this.className =
        "rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-base border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
      elements.form.dataset.googleDocId = "";
    }
  });

  // Handle file selection
  function handleFileSelection(file) {
    if (file) {
      const sizeInKB = file.size / 1024;
      const formattedSize =
        sizeInKB > 1024
          ? `${(sizeInKB / 1024).toFixed(2)} MB`
          : `${sizeInKB.toFixed(2)} KB`;

      elements.file.name.textContent = file.name;
      elements.file.size.textContent = formattedSize;
      elements.dropzone.content.classList.add("hidden");
      elements.file.info.classList.remove("hidden");
    }
  }

  elements.file.input.addEventListener("change", function () {
    if (this.files.length > 0) handleFileSelection(this.files[0]);
  });

  // Setup drag and drop
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.container.addEventListener(eventName, preventDefaults);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropzone.container.addEventListener(eventName, () => {
      elements.dropzone.container.classList.add(
        "border-blue-500",
        "bg-blue-50",
        "dark:bg-gray-600"
      );
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.container.addEventListener(eventName, () => {
      elements.dropzone.container.classList.remove(
        "border-blue-500",
        "bg-blue-50",
        "dark:bg-gray-600"
      );
    });
  });

  elements.dropzone.container.addEventListener("drop", function (e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      elements.file.input.files = files;
      handleFileSelection(files[0]);
    }
  });

  // PIN functionality
  elements.pin.toggle.addEventListener("change", function () {
    elements.pin.input.style.display = this.checked ? "block" : "none";
    if (this.checked) {
      document.getElementById("code-1").focus();
      elements.pin.input.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      elements.pin.boxes.forEach((input) => (input.value = ""));
    }
  });

  elements.pin.boxes.forEach((input, index) => {
    input.addEventListener("input", function () {
      if (this.value.length === this.maxLength) {
        const nextInput = elements.pin.boxes[index + 1];
        if (nextInput) nextInput.focus();
        else this.blur();
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && this.value === "") {
        const prevInput = elements.pin.boxes[index - 1];
        if (prevInput) prevInput.focus();
      } else if (e.key === "ArrowRight") {
        const nextInput = elements.pin.boxes[index + 1];
        if (nextInput) nextInput.focus();
      } else if (e.key === "ArrowLeft") {
        const prevInput = elements.pin.boxes[index - 1];
        if (prevInput) prevInput.focus();
      }
    });

    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.1)";
    });

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)";
    });
  });

  // Get PIN value
  function getPinValue() {
    if (!elements.pin.toggle.checked) return "";

    const pinValues = Array.from(elements.pin.boxes)
      .map((input) => input.value)
      .join("");
    return /^\d{4}$/.test(pinValues) ? pinValues : "";
  }

  // Update progress bar
  function updateProgress(percent) {
    const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
    elements.progress.circle.style.strokeDashoffset = offset;
    elements.progress.status.textContent = `${percent}%`;
  }

  // Simulate progress
  function simulateProgress() {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress > 90) clearInterval(progressInterval);
      updateProgress(progress);
    }, 300);

    setTimeout(() => clearInterval(progressInterval), 30000);
  }

  // Show success modal
  function showSuccessModal(fileId, googleDocId) {
    const rollNumber = elements.inputs.rollNumber.value;
    const experimentNo = elements.inputs.experimentNo.value;
    const subject = elements.inputs.subject.value;
    const pin = getPinValue();
    const isGoogleDoc = elements.docLink.radio.checked;

    const fileExtension = isGoogleDoc
      ? ".txt"
      : getFileExtension(elements.file.input.files[0]?.name || "");

    const pinSuffix = pin ? `_${pin}` : "";
    const docIdPart = isGoogleDoc ? `{${googleDocId}}` : "";

    const renamedFileName = `${rollNumber}_${experimentNo}_${subject} [${fileId}]${pinSuffix}${docIdPart}${fileExtension}`;

    elements.file.renamed.textContent = renamedFileName;
    elements.file.id.textContent = fileId;

    elements.sections.uploading.style.display = "none";
    elements.sections.input.style.display = "block";
    elements.sections.success.style.display = "flex";
  }

  // Reset form
  function resetForm() {
    elements.form.reset();
    elements.dropzone.content.classList.remove("hidden");
    elements.file.info.classList.add("hidden");
    elements.file.input.value = "";
    elements.docLink.input.value = "";
    elements.docLink.input.className =
      "rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-base border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
    elements.buttons.upload.disabled = false;
    elements.form.dataset.fileId = "";
    elements.form.dataset.googleDocId = "";
    elements.pin.input.style.display = "none";
    elements.pin.toggle.checked = false;
    elements.dropzone.container.style.display = "none";
    elements.docLink.div.style.display = "flex";
    elements.docLink.radio.checked = true;
    elements.fileRadio.checked = false;

    Object.values(resetDropdowns).forEach((reset) => reset());
  }

  // Handle OK button in success modal
  elements.buttons.ok.addEventListener("click", function () {
    elements.sections.success.style.display = "none";
    resetForm();
  });

  // Convert file to Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Handle upload button click
  elements.buttons.upload.addEventListener("click", async function () {
    const department = elements.inputs.department.value;
    const subject = elements.inputs.subject.value;
    const rollNumber = elements.inputs.rollNumber.value;
    const experimentNo = elements.inputs.experimentNo.value;
    const pin = getPinValue();
    const isGoogleDoc = elements.docLink.radio.checked;
    const googleDocId = elements.form.dataset.googleDocId;

    // Validation
    if (!department || !subject || !rollNumber || !experimentNo) {
      alert("Please fill all fields.");
      return;
    }

    if (elements.pin.toggle.checked && !pin) {
      alert("Please enter a valid 4-digit PIN.");
      return;
    }

    const fileId = generateFileId();
    elements.form.dataset.fileId = fileId;

    // Prepare form data
    const formData = new FormData();
    formData.append("department", department);
    formData.append("subject", subject);
    formData.append("rollNumber", rollNumber);
    formData.append("experimentNo", experimentNo);
    formData.append(
      "rootFolderId",
      document.getElementById("rootFolderId").value
    );
    formData.append("generatedFileId", fileId);

    if (isGoogleDoc) {
      if (!googleDocId) {
        alert("Please enter a valid Google Doc link.");
        return;
      }

      const pinSuffix = pin ? `_${pin}` : "";
      const newFileName = `${rollNumber}_${experimentNo}_${subject} [${fileId}]${pinSuffix}{${googleDocId}}.txt`;

      formData.append("fileName", newFileName);
      formData.append("fileData", "");
      formData.append("mimeType", "text/plain");
    } else {
      if (!elements.file.input.files.length) {
        alert("Please select a file to upload.");
        return;
      }

      const file = elements.file.input.files[0];
      const fileExtension = getFileExtension(file.name);
      const pinSuffix = pin ? `_${pin}` : "";
      const newFileName = `${rollNumber}_${experimentNo}_${subject} [${fileId}]${pinSuffix}${fileExtension}`;

      try {
        const base64Data = await fileToBase64(file);
        formData.append("fileName", newFileName);
        formData.append("fileData", base64Data);
        formData.append("mimeType", file.type);
      } catch (error) {
        alert("Error reading file.");
        console.error(error);
        return;
      }
    }

    // Show uploading section
    elements.sections.input.style.display = "none";
    elements.sections.uploading.style.display = "flex";
    updateProgress(0);
    elements.buttons.upload.disabled = true;
    simulateProgress();

    // Send AJAX request
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      if (responseData.success) {
        updateProgress(100);
        showSuccessModal(fileId, googleDocId);
      } else {
        throw new Error(responseData.error || "Unknown error");
      }
    } catch (error) {
      elements.sections.uploading.style.display = "none";
      elements.sections.input.style.display = "block";
      elements.buttons.upload.disabled = false;
      alert(`Error: ${error.message}`);
    }
  });
});
