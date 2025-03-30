// ==UserScript==
// @name         renshuu dictionary button
// @namespace    https://github.com/buruburukun
// @version      0.3
// @description  open dictionary when learning on renshuu
// @author       buruburukun
// @match        https://*.renshuu.org/*
// @grant        none
// @source       https://raw.githubusercontent.com/buruburukun/userscripts/refs/heads/main/renshuu.js
// ==/UserScript==

(function() {
    'use strict';

    function waitForElms(selector) {
        console.log("waitForElms", selector);
        return new Promise(resolve => {
            const exist = document.querySelectorAll(selector);
            if (exist.length > 0) {
                return resolve(exist);
            }
            new MutationObserver((_mutations, observer) => {
                const found = document.querySelectorAll(selector);
                if (found.length > 0) {
                    observer.disconnect();
                    resolve(found);
                }
            }).observe(document.body, {
                childList: true,
                subtree: true,
            });
        });
    }

    function vocabSearch(elem) {
        const text = elem.textContent.replaceAll("~", "");
        const dict = document.querySelector("#dict-p");
        dict.querySelector(".pure-menu label").click();
        const searchBox = dict.querySelector("#vocab_japanese");
        searchBox.value = text;
        dict.querySelector("#dict_vocab button.dsearch").click();
        openDict();
        searchBox.blur();
    }

    function delayEvent(func, elem) {
        return () => {
            globalThis.setTimeout(() => func(elem), 1);
        };
    }

    function linkToDictionary(selector) {
        const func = () => {
            waitForElms(selector).then(elems => {
                for (const elem of elems) {
                    const text = elem.textContent.trim();
                    elem.innerHTML += `<button class="buru_dict_link">${text}</button>`;
                }
                for (const elem of document.querySelectorAll(".buru_dict_link")) {
                    elem.addEventListener("click", delayEvent(vocabSearch, elem));
                }
                func();
            });
        };
        func();
    }

    const selector = ".flexterm > .print_term > div > div > div > span:has(input):not(:has(.buru_dict_link))";
    linkToDictionary(selector);
})();
