// ==UserScript==
// @name            Mastodon Pixiv Preview
// @namespace       https://onee3.org
// @version         0.1.0
// @description     Pixiv Open Graph preview images in Mastodon
// @copyright       2020, Frederick888 (https://openuserjs.org/users/Frederick888)
// @author          Frederick888
// @license         GPL-3.0-or-later
// @homepageURL     https://github.com/Frederick888/mastodon-pixiv-preview
// @supportURL      https://github.com/Frederick888/mastodon-pixiv-preview/issues
// @contributionURL https://github.com/Frederick888/mastodon-pixiv-preview/pull
// @updateURL       https://openuserjs.org/meta/Frederick888/Mastodon_Pixiv_Preview.meta.js
// @match           https://mastodon.ktachibana.party/*
// ==/UserScript==

let galleryTemplate = `
<div class="media-gallery">
    <div class="media-gallery__item" style="inset: auto; width: 100%; height: 100%;">
        <a class="media-gallery__item-thumbnail" href="" target="_blank" rel="noopener noreferrer">
            <img src=""
                srcset=""
                sizes="250px"
                style="object-position: 50.5% 20%;"
        /></a>
    </div>
</div>
`;

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function addPixivOpenGraph(container, pixivLinkContainer) {
    /*
     * Format 1: https://www.pixiv.net/member_illust.php?illust_id=<id>&mode=medium
     * Format 2: https://www.pixiv.net/artworks/<id>
     */
    let actionBar = container.querySelector('.status__action-bar');
    let pixivLink = pixivLinkContainer.getAttribute('href');
    let pixivArtworkId = pixivLink.replace(/.*pixiv\.net\/artworks\/(\d+).*|.*pixiv\.net\/.*illust_id=(\d+).*/, '$1$2');
    let pixivPreviewLink = 'https://embed.pixiv.net/decorate.php?mode=sns-automator&illust_id=' + pixivArtworkId;

    let mediaGallery = htmlToElement(galleryTemplate);
    mediaGallery.querySelector('.media-gallery__item-thumbnail').setAttribute('href', pixivLink);
    let mediaGalleryImg = mediaGallery.querySelector('img');
    mediaGalleryImg.setAttribute('src', pixivPreviewLink);
    mediaGalleryImg.setAttribute('srcset', pixivPreviewLink + ' 960w ' + pixivPreviewLink + ' 346w');

    actionBar.before(mediaGallery);
}

function mainLoop() {
    document.querySelectorAll('.status-link.unhandled-link[href*="pixiv.net"]:not([og-pixiv-processed])')
        .forEach((pixivLinkContainer) => {
            pixivLinkContainer.setAttribute('og-pixiv-processed', '1');
            let container = pixivLinkContainer.closest('.status__wrapper');
            if (container.querySelector('.media-gallery:not(.og-pixiv)') === null) {
                addPixivOpenGraph(container, pixivLinkContainer);
            }
        });
}

(function () {
    'use strict';
    if (typeof MutationObserver === 'function') {
        let observerConfig = {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        };
        let body = document.getElementsByTagName('body')[0];
        let observer = new MutationObserver(mainLoop);
        observer.observe(body, observerConfig);
    } else {
        mainLoop();
        setInterval(mainLoop, 200);
    }
})();
