/**
 * Commons Attributor: Core logic to fetch and display Wikimedia Commons attribution data.
 * NOTE: The raw data object is stored in the global scope (window.attributionData) after fetch for reuse.
 */
window.attributionData = null;

/**
 * Executes the attribution fetching process when the button is clicked.
 */
function runAttributionTool() {
    const url = document.getElementById('commonsUrl').value.trim();
    const resultsDiv = document.getElementById('results');
    const loadingMessage = document.getElementById('loading');
    const errorMessage = document.getElementById('error');
    
    // Reset previous results and messages
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
                // Store data globally for toggle function
                window.attributionData = data; 
                
                // Generate the initial rich text credit
                data.customCreditRich = generateCustomCredit(data, true);
                data.customCreditPlain = generateCustomCredit(data, false);
                
                updateResults(data);
                resultsDiv.style.display = 'block';
                document.getElementById('creditControls').style.display = 'flex'; // Show controls
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
 * Cleans up the Creation Year value, extracting only the date part, and stripping HTML/comments.
 * (Logic unchanged from previous version)
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
 * Fetches attribution details from the Wikimedia Commons API, including the file name.
 * (Logic largely unchanged from previous version)
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
        format: 'json',
        origin: '*' 
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

        const metadata = page.imageinfo[0].extmetadata;
        const infoUrl = page.imageinfo[0].descriptionurl; 

        if (!metadata) {
            return null;
        }

        const rawDate = metadata.DateTimeOriginal?.value || metadata.DateTime?.value || 'N/A';

        const attributionData = {
            fileTitle: fileTitle,
            fileName: fileName,
            commonsUrl: infoUrl,
            author: metadata.Artist?.value || 'N/A',
            authorPlain: metadata.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'N/A', 
            creationDateCleaned: cleanYearValue(rawDate), 
            licenseShort: metadata.LicenseShortName?.value || 'N/A',
            licenseUrl: metadata.LicenseUrl?.value || 'N/A',
            // License components for rich text icons
            licenseComponents: metadata.LicenseComponent?.value?.split(',') || [], 
        };
        
        return attributionData;

    } catch (e) {
        console.error("API Request failed:", e);
        return null;
    }
}

/**
 * Generates the custom attribution string based on the user's choice (rich vs plain).
 * This function also includes the Creative Commons icons logic.
 */
function generateCustomCredit(data, isRichText) {
    
    const yearMatch = data.creationDateCleaned.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[0] : 'Year Unknown';

    // 1. Author Text/Link
    // The author field from Commons API is already rich text, we just ensure it opens in a new tab.
    const authorText = isRichText 
                       ? data.author.replace(/<a\s/g, '<a target="_blank" ') 
                       : data.authorPlain;

    // 2. File Title Link/Text
    const fileTitleLink = isRichText 
                          ? `<a href="${data.commonsUrl}" target="_blank">${data.fileName}</a>`
                          : data.fileName;

    // 3. License Link/Text
    const licenseLink = isRichText && data.licenseUrl !== 'N/A'
                        ? `<a href="${data.licenseUrl}" target="_blank">${data.licenseShort}</a>`
                        : data.licenseShort;
                        
    // 4. Creative Commons Icon HTML (Rich Text only)
    let iconHtml = '';
    if (isRichText && data.licenseComponents.length > 0) {
        const iconBaseUrl = "https://mirrors.creativecommons.org/presskit/icons/";
        const iconStyle = 'style="max-width: 1em;max-height:1em;margin-left: .2em;"';
        
        // Loop through components (cc, by, sa, nc, nd)
        data.licenseComponents.forEach(component => {
            const iconName = component.toLowerCase().trim();
            if (iconName) {
                iconHtml += `<img src="${iconBaseUrl}${iconName}.svg" alt="${iconName}" ${iconStyle}>`;
            }
        });
    }
    
    // Construct the core attribution sentence:
    let coreCredit = `${fileTitleLink} © ${year} by ${authorText} is licensed under ${licenseLink}${iconHtml}`;

    if (isRichText) {
        // HTML output
        return coreCredit;
    } else {
        // Plain text output
        let plainCredit = `${data.fileName} © ${year} by ${data.authorPlain} is licensed under ${data.licenseShort}.`;
        
        if (data.licenseUrl !== 'N/A') {
            plainCredit += ` To view a copy of this license, visit ${data.licenseUrl}`;
        }
        
        // Clean up any stray HTML remaining in the credit line
        return plainCredit.replace(/<[^>]*>/g, '').trim();
    }
}

/**
 * Updates the display elements based on the fetched data.
 */
function updateResults(data) {
    // Basic fields
    document.getElementById('authorName').innerHTML = data.author;
    document.getElementById('creationYear').textContent = data.creationDateCleaned;
    document.getElementById('fileName').textContent = data.fileName;
    
    // License Display (Combined Short Name + URL as link)
    const licenseDisplay = document.getElementById('licenseDisplay');
    if (data.licenseUrl !== 'N/A') {
        licenseDisplay.innerHTML = `<a href="${data.licenseUrl}" target="_blank">${data.licenseShort}</a>`;
    } else {
        licenseDisplay.textContent = data.licenseShort;
    }
    
    // Update Full Credit Text (Initial display is Rich Text)
    document.getElementById('fullCredit').innerHTML = data.customCreditRich;
    document.getElementById('richTextToggle').checked = true;
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

    // Use the modern clipboard API
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


// Initial hide of results section until data is ready
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('results').style.display = 'none';
});