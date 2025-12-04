# 🖼️ Commons Attributor

## Quick Overview

**Commons Attributor** is a simple, browser-based tool designed to quickly generate correct, pre-formatted attribution lines for media files sourced from Wikimedia Commons. Users only need to paste the file URL, and the tool fetches the author, creation date, license, and file title via the MediaWiki API.

The primary feature is the ability to toggle between **Rich Text (HTML)** output, which includes clickable links and Creative Commons icons, and **Plain Text** output for simple documentation.

[**Tool Link**](https://kuldeepburjbhalaike.github.io/Commons-Attribution/)

## ✨ Features

  * **Single URL Input:** Simply paste the Wikimedia Commons file page URL.
  * **API-Driven:** Fetches metadata (Author, License, Date) using the official MediaWiki API (no unreliable screen scraping).
  * **Dual Output Modes:**
      * **Rich Text:** Generates an HTML snippet including links for the file, author, and license, plus embedded CC icon images.
      * **Plain Text:** Generates a clean text string with the full license URL for non-HTML environments.
  * **One-Click Copy:** Easily copy the generated attribution string to your clipboard.
  * **Clean Data:** Automatically cleans up complex date fields (like EXIF data) returned by the API to show only the relevant date/year.

-----

## 🚀 How to Use

1.  **Find your file:** Navigate to any file page on Wikimedia Commons (e.g., `https://commons.wikimedia.org/wiki/File:Example_Image.jpg`).
2.  **Paste the URL:** Copy the URL and paste it into the **Wikimedia Commons File URL** input box.
3.  **Generate:** Click the **Generate Attribution** button.
4.  **View Details:** Review the fetched **Author**, **Creation Date**, and **License** details.
5.  **Choose Output:** Under **Credit Text**, toggle the **Rich Text (HTML Links)** checkbox to select your desired format.
6.  **Copy:** Click the **Copy** button to place the formatted attribution directly into your clipboard.

-----

## 🛠️ Installation and Setup (For Developers)

This tool is built using pure **HTML, CSS, and JavaScript** and does not require any backend server, making it perfect for hosting on **GitHub Pages**.

### Project Structure

```
/commons-attributor
├── index.html    <-- The user interface and layout
└── script.js     <-- The core logic (API communication, data parsing, credit generation)
```

### Key Technologies

  * **MediaWiki Action API:** Used to query file metadata using the `prop=imageinfo&iiprop=extmetadata` modules.
  * **JavaScript `fetch()`:** Handles asynchronous communication with the API.
  * **JavaScript `navigator.clipboard.writeText()`:** Handles the one-click copy functionality.

### Running Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/Kuldeepburjbhalaike/commons-attributor.git
    ```
2.  Open the `index.html` file in your web browser.

-----

## 🔗 Attribution Format Examples

The tool generates attribution following best practices for Creative Commons and source citation.

| Format | Output Example |
| :--- | :--- |
| **Rich Text (HTML)** | `<a href="[Commons URL]">Example_Image.jpg</a> © 2025 by <a href="[Author URL]">Jane Doe</a> is licensed under <a href="[License URL]">CC BY-SA 4.0</a><img src="..." alt="cc"><img src="..." alt="by"><img src="..." alt="sa">` |
| **Plain Text** | `Example_Image.jpg © 2025 by Jane Doe is licensed under CC BY-SA 4.0. To view a copy of this license, visit [License URL]` |

-----

## 🤝 Contribution

Contributions, issues, and feature requests are welcome\! Feel free to check the [issues page](https://github.com/Kuldeepburjbhalaike/commons-attributor/issues).

## 📄 License

This project is licensed under the MIT License.

---
Made with ❤️ by [Kuldeep](https://meta.wikimedia.org/wiki/User:Kuldeepburjbhalaike)
