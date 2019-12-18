'use strict';

const oven = require("openbadges-bakery-v2");

module.exports = {
    bakeAsync: function (options) {
        return new Promise((resolve, reject) => {
            if (options.assertion)
            {
                oven.bake({image: options.image, assertion: options.assertion}, function (err, imageData) {if (err) reject(err); else resolve(imageData)});

            } else if (options.url)
            {
                oven.bake({image: options.image, url: options.url}, function (err, imageData) {if (err) reject(err); else resolve(imageData)});
            } else {
                oven.bake({image: options.image, signature: options.signature}, function (err, imageData) {if (err) reject(err); else resolve(imageData)});
            }

        })
    }
}