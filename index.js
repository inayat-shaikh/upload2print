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
    iframe: document.getElementById("hidden_iframe"),
    pin: {
      toggle: document.getElementById("pinToggle"),
      input: document.getElementById("pinInput"),
      boxes: document.querySelectorAll(".pininputbox"),
    },
  };
  const fileAccessMessage = document.getElementById("fileAccessMessage");
  const modalFileAccessMessage = document.getElementById(
    "modalFileAccessMessage"
  );

  // Constants
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw6AlbgUPkdsul6Xh3asyvOacesyA_W4ghTjMl7j3DFW8S8jd-hbjOp8B-JZE11ZSg/exec";
  const CIRCLE_RADIUS = 65;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Initialize form and progress circle
  elements.form.action = SCRIPT_URL;
  elements.form.method = "POST";
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
          block: "nearest",
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
  elements.docLink.input.addEventListener("input", async function () {
    const inputField = this;
    const link = inputField.value.trim();

    // Regular expression to extract the document ID
    const googleDocRegex =
      /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)(\/|$)/;
    const match = link.match(googleDocRegex);

    if (!link) {
      // Reset to the original style if the input is empty
      inputField.className =
        "rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-base border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
      elements.form.dataset.googleDocId = "";
      return;
    }

    if (match && match[1]) {
      const docId = match[1];
      elements.form.dataset.googleDocId = docId;

      // Check if the link has public access
      try {
        const isPublic = await checkPublicAccess(docId);
        if (isPublic) {
          // Green style if public access is confirmed
          inputField.className =
            "rounded-none rounded-e-lg bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-500 block flex-1 min-w-0 text-base p-2.5";
          fileAccessMessage.style.display = "none";
        } else {
          // Red style and alert if not public
          inputField.className =
            "rounded-none rounded-e-lg bg-red-50 border border-red-500 text-red-900 dark:text-red-400 placeholder-red-700 dark:placeholder-red-500 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 block flex-1 min-w-0 text-base p-2.5";
          alert("The link does not have 'Anyone with the link' access.");
          fileAccessMessage.style.display = "flex";
        }
      } catch (error) {
        console.error("Error checking public access:", error);
        // Red style and alert in case of an error
        inputField.className =
          "rounded-none rounded-e-lg bg-red-50 border border-red-500 text-red-900 dark:text-red-400 placeholder-red-700 dark:placeholder-red-500 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 block flex-1 min-w-0 text-base p-2.5";
        alert("Unable to verify the link's public access. Please try again.");
        fileAccessMessage.style.display = "none";
      }
    } else {
      // Red style for invalid links
      inputField.className =
        "rounded-none rounded-e-lg bg-red-50 border border-red-500 text-red-900 dark:text-red-400 placeholder-red-700 dark:placeholder-red-500 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-500 block flex-1 min-w-0 text-base p-2.5";
      elements.form.dataset.googleDocId = "";
      alert("Invalid Google Docs link. Please enter a valid link.");
    }
  });

  // Function to check public access
  async function checkPublicAccess(docId) {
    const testUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;

    try {
      const response = await fetch(testUrl, {
        method: "GET",
        mode: "cors", // Use 'cors' for cross-origin requests
        credentials: "omit", // Do not include credentials
      });

      // If fetch is successful, assume public access
      return response.ok;
    } catch (error) {
      console.error("Error fetching document:", error);
      return false; // If an error occurs, assume restricted access
    }
  }

  // Handle file selection
  function handleFileSelection(file) {
    if (file) {
      const allowedExtensions = [".doc", ".docx", ".pdf"];
      const fileExtension = getFileExtension(file.name).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Invalid file type. Only DOC, DOCX, and PDF files are allowed.");
        elements.file.input.value = ""; // Clear the file input
        elements.dropzone.content.classList.remove("hidden");
        elements.file.info.classList.add("hidden");
        return;
      }

      const sizeInKB = file.size / 1024;
      const formattedSize =
        sizeInKB > 1024
          ? `${(sizeInKB / 1024).toFixed(2)} MB`
          : `${sizeInKB.toFixed(2)} KB`;

      elements.file.name.textContent = file.name;
      elements.file.size.textContent = formattedSize;
      elements.dropzone.content.classList.add("hidden");
      elements.file.info.classList.remove("hidden");

      // Update SVG based on file type
      const fileInfoSvg = elements.file.info.querySelector("svg");
      if (fileInfoSvg) fileInfoSvg.remove();

      const isDoc = fileExtension === ".doc" || fileExtension === ".docx";
      const svgHtml = isDoc
        ? `<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class="w-16 h-16 mb-2 text-blue-500 shrink-0">
                <style type="text/css">.st0{fill:#41A5EE;} .st1{fill:#2B7CD3;} .st2{fill:#185ABD;} .st3{fill:#103F91;} .st4{opacity:0.1;enable-background:new;} .st5{opacity:0.2;enable-background:new;} .st6{fill:url(#SVGID_1_);} .st7{fill:#FFFFFF;}</style>
                <path class="st0" d="M490.17,19.2H140.9c-12.05,0-21.83,9.72-21.83,21.7l0,0v96.7l202.42,59.2L512,137.6V40.9C512,28.91,502.23,19.2,490.17,19.2z"></path>
                <path class="st1" d="M512,137.6H119.07V256l202.42,35.52L512,256V137.6z"></path>
                <path class="st2" d="M119.07,256v118.4l190.51,23.68L512,374.4V256H119.07z"></path>
                <path class="st3" d="M140.9,492.8h349.28c12.05,0,21.83-9.72,21.83-21.7l0,0v-96.7H119.07v96.7C119.07,483.09,128.84,492.8,140.9,492.8z"></path>
                <path class="st4" d="M263.94,113.92H119.07v296h144.87c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C285.73,123.65,275.98,113.96,263.94,113.92z"></path>
                <path class="st5" d="M252.04,125.76H119.07v296h132.97c12.04-0.04,21.79-9.73,21.83-21.7v-252.6C273.82,135.49,264.07,125.8,252.04,125.76z"></path>
                <path class="st5" d="M252.04,125.76H119.07v272.32h132.97c12.04-0.04,21.79-9.73,21.83-21.7V147.46C273.82,135.49,264.07,125.8,252.04,125.76z"></path>
                <path class="st5" d="M240.13,125.76H119.07v272.32h121.06c12.04-0.04,21.79-9.73,21.83-21.7V147.46C261.91,135.49,252.17,125.8,240.13,125.76z"></path>
                <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="45.8183" y1="-1083.4916" x2="216.1361" y2="-788.5082" gradientTransform="matrix(1 0 0 1 0 1192)">
                    <stop offset="0" style="stop-color:#2368C4"></stop>
                    <stop offset="0.5" style="stop-color:#1A5DBE"></stop>
                    <stop offset="1" style="stop-color:#1146AC"></stop>
                </linearGradient>
                <path class="st6" d="M21.83,125.76h218.3c12.05,0,21.83,9.72,21.83,21.7v217.08c0,11.99-9.77,21.7-21.83,21.7H21.83C9.77,386.24,0,376.52,0,364.54V147.46C0,135.48,9.77,125.76,21.83,125.76z"></path>
                <path class="st7" d="M89.56,292.21c0.43,3.35,0.71,6.26,0.85,8.76h0.5c0.19-2.37,0.59-5.22,1.19-8.56c0.6-3.34,1.15-6.16,1.63-8.47l22.96-98.49h29.68l23.81,97.01c1.38,6.03,2.37,12.15,2.96,18.3h0.39c0.44-5.97,1.27-11.9,2.48-17.76l18.99-97.6h27.02l-33.36,141.13H157.1l-22.62-93.47c-0.65-2.69-1.4-6.2-2.23-10.53s-1.33-7.48-1.54-9.47h-0.39c-0.26,2.3-0.77,5.71-1.54,10.23c-0.76,4.52-1.37,7.87-1.83,10.04l-21.27,93.17h-32.1L40.04,185.46h27.5l20.68,98.69C88.7,286.17,89.14,288.87,89.56,292.21z"></path>
            </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.320129 92.604164" class="w-16 h-16 mb-2">
  <g transform="translate(53.548057 -183.975276) scale(1.4843)">
    <path fill="#ff2116" d="M-29.632812 123.94727c-3.551967 0-6.44336 2.89347-6.44336 6.44531v49.49804c0 3.55185 2.891393 6.44532 6.44336 6.44532H8.2167969c3.5519661 0 6.4433591-2.89335 6.4433591-6.44532v-40.70117s.101353-1.19181-.416015-2.35156c-.484969-1.08711-1.275391-1.84375-1.275391-1.84375a1.0584391 1.0584391 0 0 0-.0059-.008l-9.3906254-9.21094a1.0584391 1.0584391 0 0 0-.015625-.0156s-.8017392-.76344-1.9902344-1.27344c-1.39939552-.6005-2.8417968-.53711-2.8417968-.53711l.021484-.002z" color="#000" font-family="sans-serif" overflow="visible" paint-order="markers fill stroke" style="line-height:normal;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;text-orientation:mixed;white-space:normal;shape-padding:0;isolation:auto;mix-blend-mode:normal;solid-color:#000000;solid-opacity:1"/>
    <path fill="#f5f5f5" d="M-29.632812 126.06445h28.3789058a1.0584391 1.0584391 0 0 0 .021484 0s1.13480448.011 1.96484378.36719c.79889772.34282 1.36536982.86176 1.36914062.86524.0000125.00001.00391.004.00391.004l9.3671868 9.18945s.564354.59582.837891 1.20899c.220779.49491.234375 1.40039.234375 1.40039a1.0584391 1.0584391 0 0 0-.002.0449v40.74609c0 2.41592-1.910258 4.32813-4.3261717 4.32813H-29.632812c-2.415914 0-4.326172-1.91209-4.326172-4.32813v-49.49804c0-2.41603 1.910258-4.32813 4.326172-4.32813z" color="#000" font-family="sans-serif" overflow="visible" paint-order="markers fill stroke" style="line-height:normal;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;text-orientation:mixed;white-space:normal;shape-padding:0;isolation:auto;mix-blend-mode:normal;solid-color:#000000;solid-opacity:1"/>
    <path fill="#ff2116" d="M-23.40766 161.09299c-1.45669-1.45669.11934-3.45839 4.39648-5.58397l2.69124-1.33743 1.04845-2.29399c.57665-1.26169 1.43729-3.32036 1.91254-4.5748l.8641-2.28082-.59546-1.68793c-.73217-2.07547-.99326-5.19438-.52872-6.31588.62923-1.51909 2.69029-1.36323 3.50626.26515.63727 1.27176.57212 3.57488-.18329 6.47946l-.6193 2.38125.5455.92604c.30003.50932 1.1764 1.71867 1.9475 2.68743l1.44924 1.80272 1.8033728-.23533c5.72900399-.74758 7.6912472.523 7.6912472 2.34476 0 2.29921-4.4984914 2.48899-8.2760865-.16423-.8499666-.59698-1.4336605-1.19001-1.4336605-1.19001s-2.3665326.48178-3.531704.79583c-1.202707.32417-1.80274.52719-3.564509 1.12186 0 0-.61814.89767-1.02094 1.55026-1.49858 2.4279-3.24833 4.43998-4.49793 5.1723-1.3991.81993-2.86584.87582-3.60433.13733zm2.28605-.81668c.81883-.50607 2.47616-2.46625 3.62341-4.28553l.46449-.73658-2.11497 1.06339c-3.26655 1.64239-4.76093 3.19033-3.98386 4.12664.43653.52598.95874.48237 2.01093-.16792zm21.21809-5.95578c.80089-.56097.68463-1.69142-.22082-2.1472-.70466-.35471-1.2726074-.42759-3.1031574-.40057-1.1249.0767-2.9337647.3034-3.2403347.37237 0 0 .993716.68678 1.434896.93922.58731.33544 2.0145161.95811 3.0565161 1.27706 1.02785.31461 1.6224.28144 2.0729-.0409zm-8.53152-3.54594c-.4847-.50952-1.30889-1.57296-1.83152-2.3632-.68353-.89643-1.02629-1.52887-1.02629-1.52887s-.4996 1.60694-.90948 2.57394l-1.27876 3.16076-.37075.71695s1.971043-.64627 2.97389-.90822c1.0621668-.27744 3.21787-.70134 3.21787-.70134zm-2.74938-11.02573c.12363-1.0375.1761-2.07346-.15724-2.59587-.9246-1.01077-2.04057-.16787-1.85154 2.23517.0636.8084.26443 2.19033.53292 3.04209l.48817 1.54863.34358-1.16638c.18897-.64151.47882-2.02015.64411-3.06364z"/>
    <path fill="#2c2c2c" d="M-20.930423 167.83862h2.364986q1.133514 0 1.840213.2169.706698.20991 1.189489.9446.482795.72769.482795 1.75625 0 .94459-.391832 1.6233-.391833.67871-1.056548.97958-.65772.30087-2.02913.30087h-.818651v3.72941h-1.581322zm1.581322 1.22447v3.33058h.783664q1.049552 0 1.44838-.39184.405826-.39183.405826-1.27345 0-.65772-.265887-1.06355-.265884-.41282-.587747-.50378-.314866-.098-1.000572-.098zm5.50664-1.22447h2.148082q1.560333 0 2.4909318.55276.9375993.55276 1.4133973 1.6443.482791 1.09153.482791 2.42096 0 1.3994-.4338151 2.49793-.4268149 1.09153-1.3154348 1.76324-.8816233.67172-2.5189212.67172h-2.267031zm1.581326 1.26645v7.018h.657715q1.378411 0 2.001144-.9516.6227329-.95858.6227329-2.5539 0-3.5125-2.6238769-3.5125zm6.4722254-1.26645h5.30372941v1.26645H-4.2075842v2.85478h2.9807225v1.26646h-2.9807225v4.16322h-1.5813254z" font-family="Franklin Gothic Medium Cond" letter-spacing="0" style="line-height:125%;-inkscape-font-specification:'Franklin Gothic Medium Cond'" word-spacing="4.26000023"/>
  </g>
</svg>`;

      const parser = new DOMParser();
      const svgElement = parser.parseFromString(
        svgHtml,
        "image/svg+xml"
      ).documentElement;
      elements.file.info.querySelector("div").prepend(svgElement);
    }
  }

  elements.file.input.addEventListener("change", function () {
    if (this.files.length > 0) {
      handleFileSelection(this.files[0]);
    }
  });

  elements.dropzone.container.addEventListener("drop", function (e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
      if (elements.file.input.files.length === 0) {
        // If file was invalid, don't set files to input
        return;
      }
      elements.file.input.files = files;
    }
  });
  // function handleFileSelection(file) {
  //   if (file) {
  //     const sizeInKB = file.size / 1024;
  //     const formattedSize =
  //       sizeInKB > 1024
  //         ? `${(sizeInKB / 1024).toFixed(2)} MB`
  //         : `${sizeInKB.toFixed(2)} KB`;

  //     elements.file.name.textContent = file.name;
  //     elements.file.size.textContent = formattedSize;
  //     elements.dropzone.content.classList.add("hidden");
  //     elements.file.info.classList.remove("hidden");
  //   }
  // }

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
    // Handle input
    input.addEventListener("input", function () {
      if (this.value.length === this.maxLength) {
        const nextInput = elements.pin.boxes[index + 1];
        if (nextInput) nextInput.focus();
        else this.blur();
      }
    });

    // Handle keyboard navigation
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

    // Animation effects
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

    // Safety cleanup after 30 seconds
    setTimeout(() => clearInterval(progressInterval), 30000);
  }

  // Handle form submission response
  elements.iframe.addEventListener("load", function () {
    try {
      const doc = this.contentDocument || this.contentWindow.document;
      const responseText = doc.body.innerText;

      if (responseText) {
        const response = JSON.parse(responseText);
        if (response.success) {
          updateProgress(100);
          showSuccessModal(
            elements.form.dataset.fileId,
            elements.form.dataset.googleDocId
          );
        } else {
          elements.sections.uploading.style.display = "none";
          elements.sections.input.style.display = "block";
          alert(`Error: ${response.error || "Unknown error"}`);
        }
      } else {
        updateProgress(100);
        showSuccessModal(
          elements.form.dataset.fileId,
          elements.form.dataset.googleDocId
        );
      }
    } catch (e) {
      console.log("Cross-origin response expected:", e);
      updateProgress(100);
      showSuccessModal(
        elements.form.dataset.fileId,
        elements.form.dataset.googleDocId
      );
    }
  });

  // Show success modal
  async function showSuccessModal(fileId, googleDocId) {
    const rollNumber = elements.inputs.rollNumber.value;
    const experimentNo = elements.inputs.experimentNo.value;
    const subject = elements.inputs.subject.value;
    const pin = getPinValue();

    // Simplify renamed file name to just `${experimentNo}_${subject}`
    const renamedFileName = `${experimentNo}_${subject}`;

    // Update the modal details
    document.getElementById("file-id").textContent = fileId;
    document.getElementById("renamed-file").textContent = renamedFileName;
    document.getElementById("displayRollNumber").textContent = rollNumber;

    const pinElement = document.getElementById("pin-container");
    if (pin) {
      pinElement.style.display = "block"; // Unhide the PIN container
      // Obfuscate PIN to "* * * 5"
      const obfuscatedPin = pin
        .split("")
        .map((digit, index) => (index < pin.length - 1 ? "*" : digit))
        .join(" ");
      document.getElementById("displayLastPin").textContent = obfuscatedPin;
    } else {
      pinElement.style.display = "none"; // Hide the PIN container
    }

    // Show the success modal
    elements.sections.uploading.style.display = "none";
    elements.sections.input.style.display = "block";
    elements.sections.success.style.display = "flex";

    // Check public access for the Google Doc
    if (googleDocId) {
      try {
        const isPublic = await checkPublicAccess(googleDocId);
        modalFileAccessMessage.style.display = isPublic ? "none" : "flex";

        if (!isPublic) {
          alert(
            'Your file has been uploaded. Please set your Google Doc access to "Anyone with the link" for public availability.'
          );
        }
      } catch (error) {
        console.error("Error checking public access:", error);
        alert(
          'Your file has been uploaded. Unable to verify Google Doc access. Ensure it is accessible to "Anyone with the link".'
        );
        modalFileAccessMessage.style.display = "flex";
      }
    }
    // try {
    //   const isPublic = await checkPublicAccess(googleDocId);
    //   if (!isPublic) {
    //     alert(
    //       'Your file has been uploaded but set your Google Doc access to "Anyone with the link".'
    //     );
    //     modalFileAccessMessage.style.display = "flex";
    //   }
    // } catch (error) {
    //   console.error("Error checking public access:", error);
    //   alert(
    //     'Unable to verify if your Google Doc is public. Please ensure it is accessible to "Anyone with the link".'
    //   );
    //   modalFileAccessMessage.style.display = "flex";
    // }
  }

  // Function to check public access
  async function checkPublicAccess(docId) {
    const testUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;

    try {
      const response = await fetch(testUrl, {
        method: "GET",
        mode: "cors", // Use 'cors' for cross-origin requests
        credentials: "omit", // Do not include credentials
      });

      // If fetch is successful, assume public access
      return response.ok;
    } catch (error) {
      console.error("Error fetching document:", error);
      return false; // If an error occurs, assume restricted access
    }
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
    fileAccessMessage.style.display = "none";
    modalFileAccessMessage.style.display = "none";
    // Reset dropdowns
    Object.values(resetDropdowns).forEach((reset) => reset());
  }

  // Handle OK button in success modal
  elements.buttons.ok.addEventListener("click", function () {
    elements.sections.success.style.display = "none";
    resetForm();
  });

  // Handle upload button click
  elements.buttons.upload.addEventListener("click", function () {
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

    // Prepare form data for submission
    if (isGoogleDoc) {
      if (!googleDocId) {
        alert("Please enter a valid Google Doc link.");
        return;
      }

      const pinSuffix = pin ? `_${pin}` : "";
      const newFileName = `${rollNumber}_${experimentNo}_${subject} [${fileId}]${pinSuffix}{${googleDocId}}.docx`;

      document.getElementById("fileName").value = newFileName;
      document.getElementById("fileData").value = "";
      document.getElementById("mimeType").value = "text/plain";
      document.getElementById("generatedFileId").value = fileId;

      elements.sections.input.style.display = "none";
      elements.sections.uploading.style.display = "flex";
      updateProgress(0);
      elements.buttons.upload.disabled = true;
      simulateProgress();
      elements.form.submit();
    } else {
      if (!elements.file.input.files.length) {
        alert("Please select a file to upload.");
        return;
      }

      const file = elements.file.input.files[0];
      const fileExtension = getFileExtension(file.name);
      const pinSuffix = pin ? `_${pin}` : "";
      const newFileName = `${rollNumber}_${experimentNo}_${subject} [${fileId}]${pinSuffix}${fileExtension}`;

      document.getElementById("fileName").value = newFileName;
      document.getElementById("mimeType").value = file.type;
      document.getElementById("generatedFileId").value = fileId;

      elements.sections.input.style.display = "none";
      elements.sections.uploading.style.display = "flex";
      updateProgress(0);
      elements.buttons.upload.disabled = true;

      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("fileData").value =
          e.target.result.split(",")[1];
        simulateProgress();
        elements.form.submit();
      };
      reader.readAsDataURL(file);
    }
  });
});
