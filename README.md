# 🖼️ Commons Attributor

## Quick Overview

**Commons Attributor** is a simple, browser-based tool designed to quickly generate correct, pre-formatted attribution lines for media files sourced from Wikimedia Commons. Users only need to paste the file URL, and the tool fetches the author, creation date, license, and file title via the MediaWiki API.

The primary feature is the ability to toggle between **Rich Text (HTML)** output, which includes clickable links, and **Plain Text** output for simple documentation.

[**Tool Link**](https://kuldeepburjbhalaike.github.io/Commons-Attribution/)

## ✨ Features

* **Single URL Input:** Simply paste the Wikimedia Commons file page URL.
* **Visual Confirmation:** Displays a **thumbnail** of the fetched file for instant verification.
* **API-Driven:** Fetches metadata (Author, License, Date) using the official MediaWiki API.
* **Dual Output Modes:**
    * **Rich Text:** Generates an HTML snippet including links for the file, author, and license.
    * **Plain Text:** Generates a clean text string with the full license URL for non-HTML environments.
* **Theme Control:** Supports automatic system theme detection and includes a button to **manually toggle** between Dark and Light mode.
* **One-Click Copy:** Easily copy the generated attribution string to your clipboard.
* **Clean Data:** Automatically cleans up complex date fields (like EXIF data) returned by the API to show only the relevant date/year.

---

## 🚀 How to Use

1.  **Find your file:** Navigate to any file page on Wikimedia Commons (e.g., `https://commons.wikimedia.org/wiki/File:Example_Image.jpg`).
2.  **Paste the URL:** Copy the URL and paste it into the **Wikimedia Commons File URL** input box.
3.  **Generate:** Click the **Generate Attribution** button.
4.  **Review:** Verify the **Thumbnail** and details.
5.  **Choose Output:** Under **Credit Text**, toggle the **Rich Text (HTML Links)** checkbox to select your desired format.
6.  **Copy:** Click the **Copy** button to place the formatted attribution directly into your clipboard.

---

## 🛠️ Installation and Setup

This tool is built using pure **HTML, CSS, and JavaScript** and runs entirely in the browser (client-side). It does not require a backend server.

### Running on GitHub Pages

1.  Create a new repository (e.g., `commons-attributor`).
2.  Upload the files: `index.html` and `script.js`.
3.  Go to the repository **Settings** > **Pages**.
4.  Set the source branch to `main` (or master) and the folder to `/ (root)`.
5.  Access the tool using the provided GitHub Pages URL.

***
**Note on API Access:** The tool uses the `origin: '*'` parameter in its JavaScript to correctly handle Cross-Origin Resource Sharing (CORS), which is necessary for reliably fetching data and thumbnails from Wikimedia Commons while hosted on a different domain like GitHub Pages.

---

## 🤝 Contribution

Contributions, issues, and feature requests are welcome! 

## 📄 License

This project is licensed under the MIT License.

---
Made with ❤️ by [Kuldeep](https://meta.wikimedia.org/wiki/User:Kuldeepburjbhalaike)
