/**
 * Google Apps Script to handle file uploads and folder creation with CORS support
 */
function doPost(e) {
  // Set CORS headers for the preflight request
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    // Get form data
    const department = e.parameter.department;
    const subject = e.parameter.subject;
    const fileName = e.parameter.fileName;
    const fileData = e.parameter.fileData;
    const mimeType = e.parameter.mimeType;
    const rootFolderId = e.parameter.rootFolderId || '1xfnB19Nvk0am-REJr-q9wqLoTAU3S55N';
    
    // Get the root folder
    const rootFolder = DriveApp.getFolderById(rootFolderId);
    
    // Check if the department folder exists, if not create it
    let departmentFolder;
    const departmentFolders = rootFolder.getFoldersByName(department);
    
    if (departmentFolders.hasNext()) {
      departmentFolder = departmentFolders.next();
    } else {
      departmentFolder = rootFolder.createFolder(department);
    }
    
    // Check if the subject folder exists, if not create it
    let subjectFolder;
    const subjectFolders = departmentFolder.getFoldersByName(subject);
    
    if (subjectFolders.hasNext()) {
      subjectFolder = subjectFolders.next();
    } else {
      subjectFolder = departmentFolder.createFolder(subject);
    }
    
    // Create the file in the subject folder
    const decodedFileData = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(decodedFileData, mimeType, fileName);
    const file = subjectFolder.createFile(blob);
    
    // Return success response
    response.setContent(JSON.stringify({
      success: true,
      fileId: file.getId(),
      fileUrl: file.getUrl()
    }));
    
    return response;
    
  } catch (error) {
    // Return error response
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    
    return response;
  }
}

/**
 * Handle GET requests for testing
 */
function doGet(e) {
  // Handle any GET request parameters
  const outputMode = e.parameter.output || 'html';
  
  if (outputMode === 'json') {
    // Return JSON response for testing
    return ContentService.createTextOutput(JSON.stringify({
      status: 'active',
      message: 'File Upload API is running'
    })).setMimeType(ContentService.MimeType.JSON);
  } else {
    // Return HTML for browser access
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>File Upload API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #4285f4; }
            .success { background-color: #d6f5d6; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>File Upload API</h1>
          <div class="success">
            <p>✅ The File Upload API is active and running.</p>
            <p>This web app handles file uploads to Google Drive with folder organization.</p>
          </div>
          <h2>Usage</h2>
          <p>This API expects POST requests with form data containing:</p>
          <ul>
            <li>department: Department name (e.g., "AI&DS-A")</li>
            <li>subject: Subject name (e.g., "DAA")</li>
            <li>fileName: Desired filename</li>
            <li>fileData: Base64-encoded file data</li>
            <li>mimeType: File MIME type</li>
            <li>rootFolderId: (Optional) Root folder ID</li>
          </ul>
        </body>
      </html>
    `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}
