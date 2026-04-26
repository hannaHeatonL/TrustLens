// Function to extract listing data
function updateListingData() {

    // Active Marketplace scope (quick view OR page)
    const viewer = document.querySelector(
        'div[aria-label="Marketplace Listing Viewer"]'
    );

    const scope = viewer || document;

    console.log("==================================");
    console.log("SCOPE:", viewer ? "QUICK VIEW" : "PAGE");
    console.log("==================================");

    // --------------------
    // CORE LISTING DATA
    // --------------------

    let title =
        // for some reason sometime the title is a different html selector so look for both
        scope.querySelector("h1[aria-hidden='false'] span")?.innerText.trim() ||
        scope.querySelector("h1[dir='auto'] span")?.innerText.trim() || 
        "Not found";

    console.log("title:", title);

    let price =
        scope.querySelector(
            "div.x1xmf6yo div[aria-hidden='false'] span"
        )?.innerText.trim()
        || "Not found";
    
    console.log("price:", price);

    let description =
        scope.querySelector(
            "div.xz9dl7a div[aria-hidden='false'] span"
        )?.innerText.trim()
        || "Not found";

    console.log("description:", description);

    let listingAge =
        scope.querySelector("abbr[aria-label] span")?.innerText.trim()
        ||
        scope.querySelector("abbr[aria-label]")?.getAttribute("aria-label")
        || "Not found";

    console.log("listing age:", listingAge);

    // --------------------
    // SELLER INFO
    // --------------------

    let infoSpans = scope.querySelectorAll(
        "div[role='listitem'] span"
    );

    let sellerRating = "Not found";
    let accountAge = "Not found";

    // Looping through spans to identify relevant seller info (age, rating)
    infoSpans.forEach(span => {
        let text = span.innerText.trim();

        if (text.includes("Highly rated")) {
            sellerRating = text;
        }

        if (text.includes("Joined Facebook")) {
            accountAge = text;
        }
    });
    
    console.log("seller rating:", sellerRating);
    console.log("account age:", accountAge);

    // --------------------
    // RISK SCORE CALCULATION
    // --------------------
    
    // start calculating risk score based on the extracted data
    // risk score is a scale from 1-5 with 1 being low risk and 5 being high risk, 
    // and is calculated based on a set of rules:
    let riskScore = 0;
    let reasons = [];
    const currentYear = new Date().getFullYear();

    // Normalize text for easier comparison (lowercase)
    let descriptionText = (description || "").toLowerCase();
    let listingText = (listingAge || "").toLowerCase();
    let accountText = (accountAge || "").toLowerCase();

    // --------------------
    // ACCOUNT + LISTING RULES
    // --------------------

    // If seller account is from this year
    if (accountText.includes(currentYear.toString()) && listingText !== "not found") {

        // Rule 3: New account + very recent listing
        if (
            listingText.includes("hour") ||
            listingText.includes("day")
        ) {
            // High risk: brand-new account + fresh listing
            riskScore += 4;
            reasons.push("Listing was posted recently by a brand-new account.");
        } else {
            // Medium risk: new account
            riskScore += 2;
            reasons.push("New Seller account.");
        }
    }

    // If account is from last year → slight risk
    if (accountText.includes((currentYear - 1).toString())) {
        riskScore += 1;
        reasons.push("Relatively new seller, created last year.");
    }

    // If seller is highly rated → reduce risk
    if (sellerRating.includes("Highly rated")) {
        riskScore -= 4;
        reasons.push("Trusted Seller.");
    }

    // Rule 4: 
    // --------------------
    // DESCRIPTION ANALYSIS
    // --------------------

    if (descriptionText && descriptionText !== "not found") {
        
        // Define keyword groups by risk level
        const highRiskKeywords = [
            "deposit",
            "pay first",
            "message me directly"
        ];

        const mediumRiskKeywords = [
            "shipping only",
            "will ship anywhere",
            "shipping available",
            "ship for * fee",
            "shipping fee",
            "no pickup",
            "no pick up",
            "need * gone",
            "drop off * fee",
            "deliver * fee",
            "delivery ($*)",
            "delivery($*)"
        ];

        const lowRiskKeywords = [
            "moving * can't take *",
            "cashapp",
            "zelle",
            "venmo"
        ];
        
        // Convert wildcard patterns (*) into regex
        function wildcardToRegex(pattern) {
            let escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return new RegExp(escaped.replace(/\\\*/g, ".*"), "i");
        }

        // Match keywords against description
        function matchKeywords(keywords) {
            return keywords.filter(k =>
                k.includes("*")
                    ? wildcardToRegex(k).test(descriptionText)
                    : descriptionText.includes(k)
            );
        }

        // Get matches for each risk level
        const matchedHigh = matchKeywords(highRiskKeywords);
        const matchedMedium = matchKeywords(mediumRiskKeywords);
        const matchedLow = matchKeywords(lowRiskKeywords);

        const hasHigh = matchedHigh.length > 0;
        const hasMedium = matchedMedium.length > 0;
        const hasLow = matchedLow.length > 0;

        // Apply scoring rules based on combinations
        if (hasHigh && (hasMedium || hasLow)) {
            riskScore += 3;
            reasons.push("Multiple high-risk signals in description.");
        } else if (hasMedium && hasLow) {
            riskScore += 2;
            reasons.push("Several risk indicators present in description.");
        } else {
            // Add weighted scores based on matches
            riskScore += matchedHigh.length * 1.5;
            riskScore += matchedMedium.length;
            riskScore += matchedLow.length * 0.5;

            if (
                matchedHigh.length > 0 ||
                matchedMedium.length > 0 ||
                matchedLow.length > 0
            ) {
                reasons.push("Unusual or risky wording in description.");
            }
        }
        
        // Debug logging
        console.log("Matched High:", matchedHigh);
        console.log("Matched Medium:", matchedMedium);
        console.log("Matched Low:", matchedLow);

        // Check for suspicious punctuation patterns
        const punctuationPatterns = [
            /([a-zA-Z]),([a-zA-Z])/, // missing space after comma
            /(\w)\s+,/               // extra space before comma
        ];

        let punctuationMatches = punctuationPatterns.some(p =>
            p.test(descriptionText)
        );

        // Add small risk for messy formatting
        if (punctuationMatches) {
            riskScore += 1;

            // If seller is highly rated and there are some punctuation errors, 
            // ignore them and dont push formatting issues to reasons
            if (!sellerRating.includes("Highly rated")) {
                reasons.push("Irregular formatting in description.");
            }
        }
    }

    // --------------------
    // FINAL SCORE NORMALIZATION
    // --------------------

    // Clamp score between 0 and 5
    if (riskScore < 0) riskScore = 0;
    if (riskScore > 5) riskScore = 5;

    let assessmentMessage = "";

    // Convert numeric score into human-readable label
    if (riskScore === 0) {
        assessmentMessage = "✅ No Risk";
    }
    else if (riskScore <= 1) {
        assessmentMessage = "🟢 Low Risk";
    }
    else if (riskScore <= 3) {
        assessmentMessage = "⚠️ Moderate Risk";
    }
    else {
        assessmentMessage = "🚨 High Risk";
    }


    // --------------------
    // FINAL OBJECT
    // --------------------

    // Bundle all extracted + computed data
    const finalData = {
        title,
        price,
        description,
        listingAge,
        sellerRating,
        accountAge,
        riskScore,
        reasons,
        assessmentMessage
    };

    // Send data to background/popup script
    try {
        chrome.runtime.sendMessage({ listingData: finalData });
    } catch (e) {
        console.warn("Could not send final data:", e);
    }
}

// Run once at start
updateListingData();

// --------------------
// OBSERVER SETUP
// --------------------

// Target main Facebook container
const targetNode = document.querySelector("#mount_0_0");
// Watch for DOM changes (new listings, updates, etc.)
const config = { childList: true, subtree: true };

let lastUrl = location.href;

// Re-run extraction when page content updates (but URL stays same)
const observer = new MutationObserver(() => {
    if (location.href === lastUrl) {
        updateListingData();
    }
});

// Start observing if target exists
if (targetNode) observer.observe(targetNode, config);


// --------------------
// LISTING CHANGE DETECTION
// --------------------

// Wait for new listing content to fully load before extracting
function waitForListingLoad() {
    let attempts = 0;

    const check = setInterval(() => {

        // Look for title element as signal content is ready
        const viewer = document.querySelector(
            'div[aria-label="Marketplace Listing Viewer"]'
        );
        const scope = viewer || document;

        // Look for the correct title element within the proper scope
        let titleElement =
            scope.querySelector("h1[aria-hidden='false'] span") ||
            scope.querySelector("h1[dir='auto'] span");

        // If title exists, page is ready
        if (titleElement) {
            console.log("New listing detected, updating data.");
            updateListingData();
            clearInterval(check);
        }

        attempts++;
        // Stop trying after ~6 seconds (15 * 400ms)
        if (attempts > 15) clearInterval(check);

    }, 400);
}

// Check if URL changes (user clicked a new listing)
setInterval(() => {

    if (location.href !== lastUrl) {
        lastUrl = location.href;

        console.log("Listing changed, waiting for new content...");
        waitForListingLoad();
    }

}, 800);