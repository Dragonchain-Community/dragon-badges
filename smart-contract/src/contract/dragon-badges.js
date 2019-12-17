'use strict'
const uuid = require("uuid/v4");
const jws = require("jws");
const oven = require("./bakery-mod");

/*
    Target Object: Signed Assertion (Base, no extensions)
    {
        "@context": "https://w3id.org/openbadges/v2",
        "type": "Assertion",
        "id": "urn:uuid:3bfcac4b-e3f9-456c-b194-997f4e3c2e63.json",
        "recipient": {
            "type": "email",
            "hashed": true,
            "salt": "deadsea",
            "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
        },
        "image": "https://api.dragondevices.com/image/3bfcac4b-e3f9-456c-b194-997f4e3c2e63.png",
        "issuedOn": "2016-12-31T23:59:59Z",
        "badge": {
            "id": "https://api.dragondevices.com/badgeClass/a66da451-20a2-43bb-bcea-bab2790027e4.json",
            "type": "BadgeClass",
            "name": "Member - Fellowship of the Order of Dragons",
            "description": "This badge is awarded to all members accepted to the Fellowship of the Order of Dragons.",
            "image": "https://api.dragondevices.com/image/a66da451-20a2-43bb-bcea-bab2790027e4.png",
            "criteria": {                
                "narrative": "To earn the **Fellowship Member Badge**, one must: \n\n 1. Be invited to the Fellowship of the Order of Dragons by a current member \n\n 2. Be accepted by the membership majority, and \n\n 3. Complete the requirements to become a member."
            }
            "issuer": {
                "type": "Issuer",
                "id": "https://api.dragondevices.com/issuer/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json",
                "name": "Dragonchain",
                "image": "https://api.dragondevices.com/image/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.png",
                "url": "https://www.dragonchain.com",
                "publicKey": "https://api.dragondevices.com/publicKey/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json",
                "revocationList": "https://api.dragondevices.com/revocationList/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json"
            }
        },
        "verification": {
            "type": "SignedBadge",
            "creator": "https://api.dragondevices.com/publicKey/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json"
        }
    }

    Target Object: PublicKey
    {
        "@context": "https://w3id.org/openbadges/v2",
        "type": "CryptographicKey",
        "id": "https://api.dragondevices.com/publicKey/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json",
        "owner": "https://api.dragondevices.com/issuer/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json",
        "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBG0BA...OClDQAB\n-----END PUBLIC KEY-----\n"
    }

    TargetObject: RevocationList
    {
        "@context": "https://w3id.org/openbadges/v2",
        "id": "https://api.dragondevices.com/revocationList/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json",
        "type": "RevocationList",
        "issuer": "https://api.dragondevices.com/issuer/ebee93cc-9a01-4bc4-b6ce-ffd88e23e1f5.json",
        "revokedAssertions": [
            "urn:uuid:3c574c87-b96f-4f06-8eb5-68a29335b60e",
            {
                "id": "urn:uuid:e79a6c18-787e-4868-8e65-e6a4530fb418",
                "revocationReason": "Honor code violation"
            },
            {
                "uid": "abc123",
                "revocationReason": "Issued in error."
            }
        ]
    }
*/

module.exports = {
    // Dragonchain SDK client instance //
    client: null,

    config: {
        publicKey: null,
        privateKey: null
    },

    // +++ Main contract methods +++ //
    createIssuer: async function (requestTxnId, parameters)
    {
        const inIssuer = parameters.issuer;        

        if (typeof inIssuer.name === "undefined" || inIssuer.name.trim() == "")
            throw "Issuer name must be specified.";

        let entity = {
            "entityId": requestTxnId,
            "type": "Issuer"
        };

        entity = {...entity, ...inIssuer};

        let imageKey = null;
        let imageObj = null;
        
        // If image data is passed, create separate heap object and delete from main object //
        if (typeof entity.imageObject !== "undefined")
        {
            imageObj = entity.imageObject; // Expected: {extension: "[png|jpg|svg]", contentType: "[image/png|image/jpg|image/svg|...]", data: "asdf1234..."}

            imageKey = `image-${requestTxnId}`;

            delete entity.imageObject;
        }

        // Create a publicKey record and link to entity //
        const publicKeyKey = `publicKey-${requestTxnId}`;

        const publicKey = {
            "type": "CryptographicKey",
            "issuerEntityId": requestTxnId,
            "publicKeyPem": this.config.publicKey
        };

        // Create a revocationList record and link to entity //
        const revocationListKey = `revocationList-${requestTxnId}`;

        const revocationList = {
            "issuerEntityId": requestTxnId,
            "type": "RevocationList",            
            "revokedAssertions": []
        };

        const entityKey = `issuer-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createIssuer",
                "entity": entity
            },
            [entityKey]: entity,
            [publicKeyKey]: publicKey,
            [revocationListKey]: revocationList
        };

        if (imageKey !== null)
            output[imageKey] = imageObj;

        return output;
    },

    createBadgeClass: async function (requestTxnId, parameters)
    {
        const inBadgeClass = parameters.badgeClass;

        if (typeof inBadgeClass.issuerEntityId === "undefined" || inBadgeClass.issuerEntityId.trim() == "")
            throw "Badge class issuer must be specified.";

        if (typeof inBadgeClass.name === "undefined" || inBadgeClass.name.trim() == "")
            throw "Badge class name must be specified.";
        
        if (typeof inBadgeClass.description === "undefined" || inBadgeClass.description.trim() == "")
            throw "Badge class description must be specified.";

        if (typeof inBadgeClass.imageObject === "undefined")
            throw "Badge class image must be specified.";

        if (inBadgeClass.imageObject.extension != "png" && inBadgeClass.imageObject.extension != "svg")
            throw "Only PNG and SVG are supported for badge class images.";

        if (typeof inBadgeClass.criteria === "undefined" || typeof inBadgeClass.criteria.narrative === "undefined")
            throw "Badge class criteria must be specified.";
            

        let entity = {
            "entityId": requestTxnId,
            "type": "BadgeClass"
        };

        entity = {...entity, ...inBadgeClass};

        const imageObj = entity.imageObject; // Expected: {extension: "[png|svg]", contentType: "[image/png|image/svg|...]", data: "asdf1234..."}

        const imageKey = `image-${requestTxnId}`;

        delete entity.imageObject;

        const entityKey = `badgeClass-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createBadgeClass",
                "entity": entity
            },
            [entityKey]: entity,
            [imageKey]: imageObj
        }

        return output;
    },

    createSignedAssertion: async function (requestTxnId, parameters)
    {
        const inAssertion = parameters.assertion;
        const urlPrefix = parameters.urlPrefix;

        // Create the Assertion object and a separate JWS string on the heap //

        const badgeClass = await this.getHeapObject({key: `badgeClass-${inAssertion.badgeClassEntityId}`});

        const badgeClassImageObject = await this.getHeapObject({key: `image-${inAssertion.badgeClassEntityId}`});

        const issuer = await this.getHeapObject({key: `issuer-${badgeClass.issuerEntityId}`});

        const issuerImageObject = await this.getHeapObject({key: `image-${badgeClass.issuerEntityId}`});

        let entity = {
            "entityId": requestTxnId,
            "type": "Assertion"
        };

        entity = {...entity, ...inAssertion};

        const assertionKey = `assertion-${requestTxnId}`;

        let assertionObject = {
            "@context": "https://w3id.org/openbadges/v2",
            "type": "Assertion",
            "id": `urn:uuid:${requestTxnId}`,
            "recipient": entity.recipient,            
            "issuedOn": entity.issuedOn,            
            "badge": {
                "id": `${urlPrefix}/badgeClass/${badgeClass.entityId}.json`,
                "type": "BadgeClass",
                "name": badgeClass.name,
                "description": badgeClass.description,
                "criteria": badgeClass.criteria,
                "image": `${urlPrefix}/image/${badgeClass.entityId}.${badgeClassImageObject.extension}`,
                "issuer": {
                    "id": `${urlPrefix}/issuer/${issuer.entityId}.json`,
                    "type": "Issuer",
                    "name": issuer.name,
                    "description": issuer.description,
                    "url": issuer.url,
                    "image": `${urlPrefix}/image/${issuer.entityId}.${issuerImageObject.extension}`,
                    "publicKey": `${urlPrefix}/publicKey/${issuer.entityId}.json`,
                    "revocationList": `${urlPrefix}/revocationList/${issuer.entityId}.json`
                }
            },
            "image": `${urlPrefix}/image/${requestTxnId}.${badgeClassImageObject.extension}`,
            "verification": {
                "type": "SignedBadge",
                "creator": `${urlPrefix}/publicKey/${issuer.entityId}.json`
            }
        }

        // Create the JWS //
        const assertionSignatureKey = `assertionSignature-${requestTxnId}`;

        const assertionSignature = jws.sign({
            header: {alg: 'RS256'},
            payload: assertionObject,
            privateKey: this.config.privateKey
        });

        // Bake the image //
        let imageBuffer = Buffer.from(badgeClassImageObject.data, "base64");
        
        const bakedImageBuffer = await oven.bakeAsync({image: imageBuffer, signature: assertionSignature});

        //console.log(bakedImageBuffer.toString("base64"));

        const bakedImageKey = `image-${requestTxnId}`;

        const bakedImageObject = {
            "extension": badgeClassImageObject.extension,
            "contentType": badgeClassImageObject.contentType,
            "data": bakedImageBuffer.toString("base64")
        }

        let output = {
            "response": {
                "type": "createAssertion",
                "entity": entity
            },
            [assertionKey]: assertionObject,
            [assertionSignatureKey]: assertionSignature,
            [bakedImageKey]: bakedImageObject
        }

        return output;
    },


    
    // +++ API Key Management Methods +++ //
    createMasterAPIKey: async function (requestTxnId, parameters) 
    {
        let apiKeyMap = null;

        try {
            apiKeyMap = await this.getAPIKeyMapObject();
        } catch (exception) {

        }

        if (apiKeyMap != null)
            throw "Master API Key already exists.";

        let output = {
            "apiKeyMap": {
                "master": parameters.keyHash
            }
        }

        return output;
    },
    

    createAPIKey: async function (requestTxnId, parameters) 
    {
        const inApiKey = parameters.apiKey;

        let apiKeyMap = await this.getAPIKeyMapObject();

        apiKeyMap[inApiKey.entityId] = inApiKey.keyHash;

        let output = {
            "apiKeyMap": apiKeyMap
        }

        return output;
    },

    // +++ Helper Methods +++ //
    getAPIKeyMapObject: async function () {
        try {
            const objResponse = await this.client.getSmartContractObject({key:`apiKeyMap`})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "API Keys Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getHeapObject: async function (options) {
        try {
            const objResponse = await this.client.getSmartContractObject({key: options.key})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "Object Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    }
}