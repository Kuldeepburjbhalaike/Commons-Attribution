/**
 * Commons Attributor: Core logic to fetch and display Wikimedia Commons attribution data.
 */
window.attributionData = null;

// --- THEME MANAGEMENT LOGIC ---

/**
 * Loads the theme preference from local storage or defaults to system preference.
 */
function loadTheme() {
    const body = document.body;
    const toggleButton = document.getElementById('themeToggleButton');
    
    let theme = localStorage.getItem('theme');
    
    if (!theme) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'dark';
        } else {
            theme = 'light';
        }
    }

    applyTheme(theme, body, toggleButton);
}

/**
 * Applies the selected theme class and updates the toggle button text.
 */
function applyTheme(theme, body, button) {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
        button.textContent = '🌙 Toggle Theme';
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        button.textContent = '☀️ Toggle Theme';
    }
}

/**
 * Toggles the theme between light and dark on button click.
 */
function toggleTheme() {
    const body = document.body;
    
    let newTheme;

    if (body.classList.contains('dark-theme')) {
        newTheme = 'light';
    } else {
        newTheme = 'dark';
    }

    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, body, document.getElementById('themeToggleButton'));
}

// --- ATTRIBUTION LOGIC ---

/**
 * Executes the attribution fetching process when the button is clicked.
 */
function runAttributionTool() {
    const url = document.getElementById('commonsUrl').value.trim();
    const resultsDiv = document.getElementById('results');
    const loadingMessage = document.getElementById('loading');
    const errorMessage = document.getElementById('error');
    
    // Clear previous results and hide controls
    resultsDiv.style.display = 'none';
    document.getElementById('creditControls').style.display = 'none';
    errorMessage.textContent = '';
    
    if (!url || !url.includes('commons.wikimedia.org/wiki/File:')) {
        errorMessage.textContent = 'Please enter a valid Wikimedia Commons file URL.';
        return;
    }

    loadingMessage.style.display = 'block';

    getCommonsAttribution(url)
        .then(data => {
            loadingMessage.style.display = 'none';
            if (data) {
                window.attributionData = data; 
                data.customCreditRich = generateCustomCredit(data, true);
                data.customCreditPlain = generateCustomCredit(data, false);
                
                updateResults(data);
                resultsDiv.style.display = 'block';
                document.getElementById('creditControls').style.display = 'flex'; 
            } else {
                errorMessage.textContent = 'Could not fetch attribution data. Please check the URL or if the file exists.';
            }
        })
        .catch(error => {
            loadingMessage.style.display = 'none';
            errorMessage.textContent = `An unexpected error occurred: ${error.message}`;
            console.error(error);
        });
}


/**
 * Cleans up the Creation Year value, extracting only the date part.
 */
function cleanYearValue(rawDateValue) {
    if (!rawDateValue || rawDateValue === 'N/A') {
        return 'N/A';
    }
    
    let strippedValue = rawDateValue.replace(/<[^>]*>/g, '').trim();
    strippedValue = strippedValue.split('(')[0].trim();
    strippedValue = strippedValue.split(',')[0].trim();
    
    return strippedValue; 
}


/**
 * Fetches attribution details from the Wikimedia Commons API, including the thumbnail.
 */
async function getCommonsAttribution(url) {
    
    const fileTitleMatch = url.split('File:');
    if (fileTitleMatch.length < 2) return null;
    
    let fileTitle = 'File:' + fileTitleMatch[1].split('#')[0].split('?')[0];
    fileTitle = fileTitle.replace(/ /g, '_'); 

    const fileName = fileTitle.split(':')[1].replace(/_/g, ' '); 

    const API_ENDPOINT = "https://commons.wikimedia.org/w/api.php";
    const params = new URLSearchParams({
        action: 'query',
        prop: 'imageinfo',
        titles: fileTitle,
        iiprop: 'extmetadata|url', 
        iiurlwidth: 180, 
        iilimit: 1, 
        origin: '*', 
        format: 'json',
    });

    const apiUrl = `${API_ENDPOINT}?${params.toString()}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (page.missing || !page.imageinfo) {
             return null;
        }

        const imageInfo = page.imageinfo[0];
        const metadata = imageInfo.extmetadata;
        const infoUrl = imageInfo.descriptionurl; 
        const thumbUrl = imageInfo.thumburl; 
        const thumbWidth = imageInfo.thumbwidth; 

        if (!metadata) {
            return null;
        }

        const rawDate = metadata.DateTimeOriginal?.value || metadata.DateTime?.value || 'N/A';

        const attributionData = {
            fileTitle: fileTitle,
            fileName: fileName,
            commonsUrl: infoUrl,
            thumbUrl: thumbUrl,
            thumbWidth: thumbWidth,
            author: metadata.Artist?.value || 'N/A',
            authorPlain: metadata.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'N/A', 
            creationDateCleaned: cleanYearValue(rawDate), 
            licenseShort: metadata.LicenseShortName?.value || 'N/A',
            licenseUrl: metadata.LicenseUrl?.value || 'N/A',
        };
        
        return attributionData;

    } catch (e) {
        console.error("API Request failed:", e);
        return null;
    }
}

/**
 * Generates the custom attribution string based on the user's choice (rich vs plain).
 */
function generateCustomCredit(data, isRichText) {
    
    const yearMatch = data.creationDateCleaned.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[0] : 'Year Unknown';

    const authorText = isRichText 
                       ? data.author.replace(/<a\s/g, '<a target="_blank" ') 
                       : data.authorPlain;

    const fileTitleLink = isRichText 
                          ? `<a href="${data.commonsUrl}" target="_blank">${data.fileName}</a>`
                          : data.fileName;

    const licenseLink = isRichText && data.licenseUrl !== 'N/A'
                        ? `<a href="${data.licenseUrl}" target="_blank">${data.licenseShort}</a>`
                        : data.licenseShort;
                        
    // Check for CC0 license
    const isCC0 = data.licenseShort.toUpperCase().includes('CC0');

    let coreCredit;

    if (isRichText) {
        if (isCC0) {
            // NEW CC0 FORMAT: File by Author is marked CC0 1.0
            coreCredit = `${fileTitleLink} by ${authorText} is marked ${licenseLink}`;
        } else {
            // Standard FORMAT: File © Year by Author is licensed under License
            coreCredit = `${fileTitleLink} © ${year} by ${authorText} is licensed under ${licenseLink}`;
        }
        return coreCredit;
        
    } else {
        // Plain Text Format (No change needed)
        let plainCredit = `${data.fileName} © ${year} by ${data.authorPlain} is licensed under ${data.licenseShort}.`;
        
        if (data.licenseUrl !== 'N/A') {
            plainCredit += ` To view a copy of this license, visit ${data.licenseUrl}`;
        }
        
        return plainCredit.replace(/<[^>]*>/g, '').trim();
    }
}

/**
 * Updates the display elements based on the fetched data, including the thumbnail.
 */
function updateResults(data) {
    const isRichText = document.getElementById('richTextToggle').checked;
    
    document.getElementById('authorName').innerHTML = data.author;
    document.getElementById('creationYear').textContent = data.creationDateCleaned;
    document.getElementById('fileName').textContent = data.fileName;
    
    const licenseDisplay = document.getElementById('licenseDisplay');
    if (data.licenseUrl !== 'N/A') {
        licenseDisplay.innerHTML = `<a href="${data.licenseUrl}" target="_blank">${data.licenseShort}</a>`;
    } else {
        licenseDisplay.textContent = data.licenseShort;
    }
    
    // Thumbnail Logic
    const thumbnailImg = document.getElementById('fileThumbnail');
    if (data.thumbUrl && data.thumbUrl !== 'N/A') {
        thumbnailImg.src = data.thumbUrl;
        thumbnailImg.width = data.thumbWidth;
        thumbnailImg.style.display = 'block';
    } else {
        thumbnailImg.style.display = 'none';
        thumbnailImg.src = ''; 
    }
    
    const fullCreditPre = document.getElementById('fullCredit');
    
    if (isRichText) {
        fullCreditPre.innerHTML = data.customCreditRich;
    } else {
        fullCreditPre.textContent = data.customCreditPlain;
    }
}

/**
 * Regenerates and updates the credit display when the rich text toggle is changed.
 */
function updateCreditDisplay() {
    if (!window.attributionData) return;
    
    const isRichText = document.getElementById('richTextToggle').checked;
    const fullCreditPre = document.getElementById('fullCredit');
    
    if (isRichText) {
        fullCreditPre.innerHTML = window.attributionData.customCreditRich;
    } else {
        fullCreditPre.textContent = window.attributionData.customCreditPlain;
    }
}

/**
 * Copies the appropriate credit line (HTML or Plain Text) to the clipboard.
 */
function copyCredit() {
    const isRichText = document.getElementById('richTextToggle').checked;
    const copyButton = document.getElementById('copyButton');
    
    let textToCopy;
    
    if (isRichText) {
        textToCopy = window.attributionData.customCreditRich;
    } else {
        textToCopy = window.attributionData.customCreditPlain;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    }).catch(err => {
        alert('Could not copy text: ' + err);
        console.error('Copy failed:', err);
    });
}


// FIX: Ensure theme is loaded reliably after DOM content is ready.
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('results').style.display = 'none';
    loadTheme(); // Load theme on startup
});
