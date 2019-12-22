'use strict';

const oven = require("openbadges-bakery-v2");

module.exports = {
    extractAsync: function (image) {
        return new Promise((resolve, reject) => {            
            oven.extract(image, function (err, data) {if (err) reject(err); else resolve(data)});
        })
    }
}