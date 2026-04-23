# TrustLens
TrustLens is a Chrome extension that analyzes Facebook Marketplace listings and generates a real-time risk score based on seller behavior, listing content, and detected scam patterns.

The goal of the system is to help users quickly identify potentially risky listings and make more informed purchasing decisions.

/* =========================================================

TRUSTLENS SYSTEM NOTE

   Some scoring rules depend on Facebook seller data
   (account age and rating).

   If user is not logged in seller data is not available:
   - Seller-based rules are skipped
   - No trust adjustments are applied
   - Only visible listing data is used (title, description, etc.)

   System continues normally with reduced feature set.
   
   ========================================================= */

To install and run the extension locally:

1. Download or clone this repository:

git clone https://github.com/hannaHeatonL/TrustLens.git

2. Open Google Chrome and navigate to:

chrome://extensions/

3. Enable Developer Mode (top right corner)

4. Click “Load unpacked”

5. Select the TrustLens project folder

The extension will now appear in your Chrome toolbar

How to Test the Extension

To test functionality:

1. Go to Facebook Marketplace:

https://www.facebook.com/marketplace

2. Click on any listing

3. Open the TrustLens extension popup

The system will automatically:

- Extract listing data (title, price, description, seller info)
- Analyze risk factors using rule-based scoring
- Generate a risk score (1–5 scale)
- Display explanation reasons for the score

Functionality Overview

The extension provides:

- Real-time listing detection using MutationObserver and URL monitoring
- Rule-based risk scoring system
- Seller account age and rating analysis
- Keyword-based scam detection in listing descriptions
- Transparent explanation system (“reasons” for each score)
- Color-coded risk levels:
🟢 Low Risk
🟡 Medium Risk
🔴 High Risk

System Behavior

The extension continuously monitors Marketplace navigation. When a new listing is detected, it automatically extracts and re-analyzes the content, ensuring the displayed risk score is always up to date.

Final Notes

- Built using JavaScript, HTML, CSS, and Chrome Extension APIs (Manifest V3)
- Runs entirely in-browser with no external servers or APIs
- Designed for real-time scam awareness during Marketplace browsing
