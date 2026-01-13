// ==UserScript==
// @name         renshuu dictionary button
// @namespace    https://github.com/buruburukun
// @version      0.8
// @description  open dictionary when learning on renshuu
// @author       buruburukun
// @match        https://*.renshuu.org/*
// @grant        none
// @source       https://raw.githubusercontent.com/buruburukun/userscripts/refs/heads/main/renshuu.js
// ==/UserScript==

(function() {
    'use strict';

    function waitForElms(selector) {
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

    function forever(selector, action) {
        const func = () => {
            waitForElms(selector).then(elems => {
                elems.forEach(action);
                func();
            });
        };
        func();
    }

    function clean(s) {
        return s.replace(/^~+/, "").replace(/~*\/~*/, "/").replace(/~+$/, "");
    }

    function makeIcon(searchTerm) {
        const icon = document.createElement("i");
        icon.setAttribute("onclick", `dJ('v','j=${searchTerm}');`);
        icon.setAttribute("class", "kao_icon ki_book buru_dict_link");
        return icon;
    }

    function linkToDictionary(elem) {
        let term = "";
        for (const child of elem.childNodes) {
            if (child.tagName === "SPAN" || child.nodeType === Node.TEXT_NODE && child.nodeValue.trim().length > 0) {
                term += child.textContent.trim();
            }
        }
        const icon = makeIcon(clean(term));
        elem.parentElement.insertBefore(icon, elem.nextSibling);
    }
    const selector = "div.print_term:not(:has(.buru_dict_link)) > div.flexbox > div.grow > div:not(.term_pitch_box) > span";
    forever(selector, linkToDictionary);
    const missSelector = "#me_miss_bodies:not(:has(.buru_dict_link)) div.flexbox > div.grow > div > span[style='font-size:14pt']";
    forever(missSelector, linkToDictionary);

    function linkAnswerToDictionary(elem) {
        let kanji = "";
        let kana = "";
        for (const child of elem.children) {
            if (child.tagName === "RUBY") {
                const spans = child.querySelectorAll("span");
                if (spans.length > 0) {
                    for (const span of spans) {
                        kanji += span.textContent;
                    }
                    const rt = child.querySelector("rt");
                    kana += rt.textContent;
                } else {
                    kanji += child.childNodes[0].textContent;
                    kana += child.childNodes[0].textContent;
                }
            }
        }
        const searchTerm = clean(`${kanji}/${kana}`);
        const icon = makeIcon(searchTerm);
        let container = elem.querySelector("div.ib");
        if (container === null) {
            container = document.createElement("div");
            container.setAttribute("class", "ib little");
            container.setAttribute("style", "vertical-align: bottom");
            elem.querySelector("br")?.remove();
            elem.append(container);
        }
        container.append(icon);
    }
    const answerSelector = "div.full_term:not(:has(.buru_dict_link)) > div > div > div > div.grow";
    forever(answerSelector, linkAnswerToDictionary);

    function kanjiIndex(elem) {
        elem.setAttribute("data-klook", "");
    }
    const kanjiIndexSelector = "#thelist > div > div.ki_block > span:not([data-klook])";
    forever(kanjiIndexSelector, kanjiIndex);

    function linkUserNoteToDictionary(elem) {
        const sep = ", ";
        const elems = [];
        for (const word of elem.textContent.split(sep)) {
            const sub = document.createElement("span");
            sub.textContent = word;
            elems.push(sub);
            elems.push(makeIcon(word));
        }
        elem.textContent = "";
        for (const sub of elems) {
            elem.appendChild(sub);
        }
    }
    const userNoteSelector = "#ureibun_vnsent > strong:not(:has(.buru_dict_link))";
    forever(userNoteSelector, linkUserNoteToDictionary);
})();
