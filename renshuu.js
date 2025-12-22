// ==UserScript==
// @name         renshuu dictionary button
// @namespace    https://github.com/buruburukun
// @version      0.6
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
        const text = elem.getAttribute("buru_dict").replaceAll("~", "");
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
                    for (const node of elem.childNodes) {
                        if (node.nodeType == Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
                            const link = document.createElement("span");
                            link.textContent = node.textContent;
                            link.setAttribute("class", "buru_dict_link");
                            link.setAttribute("buru_dict", elem.textContent);
                            link.addEventListener("click", delayEvent(vocabSearch, link));
                            node.replaceWith(link);
                        }
                    }
                }
                func();
            });
        };
        func();
    }

    const selector = "div.print_term > div.flexbox > div.grow > div:not(.term_pitch_box) > span:not(:has(.buru_dict_link))";
    linkToDictionary(selector);
})();
