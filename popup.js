function renderListing(data) {
    if (!data) {
        document.getElementById("content").innerText = "No listing data available.";
        return;
    }

    let riskClass = "low-risk";

    if (data.riskScore >= 4) {
        riskClass = "high-risk";
    }
    else if (data.riskScore >= 2) {
        riskClass = "medium-risk";
    }

    let reasonsHTML = "";

    if (data.reasons.length > 0) {
        reasonsHTML = "<ul>";
        data.reasons.forEach(reason => {
            reasonsHTML += `<li>${reason}</li>`;
        });
        reasonsHTML += "</ul>";
    } else {
        reasonsHTML = "<p class='small-text'>No risk indicators detected.</p>";
    }

    let html = `
        <h2>${data.title}</h2>

        <div class="risk-box ${riskClass}">
            Risk Score: ${data.riskScore} / 5 (${data.assessmentMessage})
        </div>

        <p><strong>Reasons:</strong></p>
        ${reasonsHTML}
    `;

    document.getElementById("content").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {

    // 1. Get the latest saved listing from Chrome storage
    chrome.storage.local.get("listingData", (result) => {
        if (result.listingData) {
            renderListing(result.listingData);
        } else {
            document.getElementById("content").innerText =
                "No listing data available yet.";
        }
    });

    // 2. Listen for real-time updates (when content script sends new listing data)
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.listingData) {
            renderListing(changes.listingData.newValue);
        }
    });

});