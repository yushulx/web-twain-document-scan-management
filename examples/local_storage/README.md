# Document Scanning with Local Disk Storage

This project demonstrates how to build a web-based document scanning application using [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) that securely saves scanned images to the local hard disk.

Unlike standard browser `localStorage` which has size limits and is cleared easily, this application uses the **Local Disk Storage** feature of the Dynamic Web TWAIN service. This ensures that scanned documents are persisted on the user's machine, allowing for crash recovery and handling large volumes of data without browser memory constraints.

https://github.com/user-attachments/assets/0e1220fa-33e9-4422-bf3b-fcb489c7845a

## Features

*   **Document Scanning**: Scan documents from TWAIN/WIA/SANE/ICA compatible scanners.
*   **Local Disk Storage**: Automatically saves scanned images to a local directory.
*   **Crash Recovery**: Restores the scanning session (images) if the browser is closed or crashes.
*   **Image Management**:
    *   **Delete Selected**: Remove the currently selected image.
    *   **Delete All**: Clear all images from the viewer and local storage.
*   **Page Counter**: Real-time display of the current page index and total page count (e.g., "Page: 1 / 5").

## Prerequisites

*   **Dynamic Web TWAIN Service**: The application requires the Dynamic Web TWAIN service to be installed on the client machine to communicate with scanners and handle local file operations. The application will prompt for installation if it's not detected.

## How to Run

1.  Clone or download this repository.
2.  Navigate to the project directory in your terminal:
    ```bash
    cd web-document-management/examples/local_storage
    ```
3.  Start a local web server. You can use Python's built-in HTTP server:
    ```bash
    python -m http.server
    ```
4.  Open your web browser and visit:
    `http://localhost:8000`

## Usage

1.  **Select Source**: Choose your scanner from the dropdown list.
2.  **Scan**: Click the **Scan** button to acquire images.
3.  **Auto-Save**: The "Auto-Save to Storage" checkbox is checked by default. This ensures images are saved to disk immediately.
4.  **Manage Images**: Click on an image to select it. Use **Delete Selected** to remove it, or **Delete All** to clear the session.
5.  **Restore Session**: Close the browser tab and reopen it. Your previously scanned images will be automatically restored.
