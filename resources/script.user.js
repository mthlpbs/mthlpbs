// ==UserScript==
// @name         a
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  dd
// @author       You
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // HackClub AI API configuration
    const API_KEY = 'sk-hc-v1-60dd1de8b77a4372ad94f4c803aea859d31df260d3934ff2b126cf8221a6702b';
    const BASE_URL = 'https://ai.hackclub.com/proxy/v1';
    const MODEL = 'google/gemini-2.5-flash';

    // Add CSS for the answer display
    GM_addStyle(`
        #mcq-answer-popup {
            position: fixed;
            bottom: 6px;
            right: 6px;
            color: black;
            padding: 5px 8px;
            font-family: monospace;
            font-size: 8px;
            z-index: 999999;
            max-width: 100px;
        }
    `);

    // Function to show answer
    function showAnswer(answer) {
        const existingPopup = document.getElementById('mcq-answer-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.id = 'mcq-answer-popup';
        popup.textContent = answer;
        document.body.appendChild(popup);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 3000);
    }

    // Function to call HackClub AI API using GM_xmlhttpRequest to bypass CORS
    async function callHackClubAI(question) {
        return new Promise((resolve, reject) => {
            const requestData = {
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at answering multiple choice questions. When given an MCQ question with options, return ONLY the correct answer. If options are labeled with letters (a, b, c, d), return just the letter. If options are numbered (1, 2, 3, 4), return just the number. If options are not clearly labeled, return the first 3 words of the correct answer option. Be concise and accurate.'
                    },
                    {
                        role: 'user',
                        content: `Please answer this multiple choice question:\n\n${question}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 50
            };

            GM_xmlhttpRequest({
                method: 'POST',
                url: `${BASE_URL}/chat/completions`,
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(requestData),
                onload: function(response) {
                    try {
                        if (response.status >= 200 && response.status < 300) {
                            const data = JSON.parse(response.responseText);
                            resolve(data.choices[0].message.content.trim());
                        } else {
                            reject(new Error(`API request failed: ${response.status} - ${response.statusText}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse API response: ${error.message}`));
                    }
                },
                onerror: function(error) {
                    reject(new Error(`Network error: ${error.error || 'Connection failed'}`));
                },
                ontimeout: function() {
                    reject(new Error('Request timeout'));
                },
                timeout: 30000 // 30 seconds timeout
            });
        });
    }

    // Function to read clipboard content
    async function readClipboard() {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                return await navigator.clipboard.readText();
            } else {
                // Fallback for older browsers
                throw new Error('Clipboard API not supported');
            }
        } catch (error) {
            console.error('Error reading clipboard:', error);
            throw new Error('Could not read clipboard. Please make sure you have copied the MCQ question.');
        }
    }

    // Function to process MCQ question
    async function processMCQ() {
        try {
            const clipboardText = await readClipboard();
            if (clipboardText && clipboardText.trim().length > 0) {
                const answer = await callHackClubAI(clipboardText);
                showAnswer(answer);
            }
        } catch (error) {
            // Silent fail - no error display
        }
    }

    // Listen for keydown events
    document.addEventListener('keydown', function(event) {
        // Check if Numpad 0 is pressed (keyCode 96 or key '0' on numpad)
        if (event.code === 'Numpad0' || (event.code === 'Digit0' && event.location === 3)) {
            event.preventDefault();
            processMCQ();
        }
    });

    // MCQ Helper loaded silently

})();