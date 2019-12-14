'use strict'
const uuid = require("uuid/v4");

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

        /*
            Example (from spec):
            {
                "@context": "https://w3id.org/openbadges/v2",
                "type": "Issuer",
                "id": "https://example.org/organization.json",
                "name": "An Example Badge Issuer",
                "image": "https://example.org/logo.png",
                "url": "https://example.org",
                "email": "contact@example.org",
                "publicKey": "https://example.org/publicKey.json",
                "revocationList": "https://example.org/revocationList.json"
            }

        */


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
            imageObj = entity.imageObject; // Expected: {contentType: "[image/png|image/jpg|image/svg|...]", data: "asdf1234..."}

            imageKey = `image-${requestTxnId}`;

            delete entity.image;
        }

        const entityKey = `entity-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createIssuer",
                "entity": entity
            },
            [entityKey]: entity
        }

        if (imageKey !== null)
            output[imageKey] = imageObj;

        return output;
    },

    createBadgeClass: async function (requestTxnId, parameters)
    {
        const inBadgeClass = parameters.badgeClass;

        
        let entity = {
            "id": requestTxnId,
            "type": "badgeClass"
        };

        entity = {...entity, ...inBadgeClass};

        const entityKey = `entity-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createBadgeClass",
                "entity": entity
            },
            [entityKey]: entity
        }

        return output;
    },

    createHostedAssertion: async function (requestTxnId, parameters)
    {
        const inAssertion = parameters.assertion;

        
        let entity = {
            "id": requestTxnId,
            "type": "assertion"
        };

        entity = {...entity, ...inAssertion};

        const entityKey = `entity-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createAssertion",
                "entity": entity
            },
            [entityKey]: entity
        }

        return output;
    },

    createSignedAssertion: async function (requestTxnId, parameters)
    {
        const inAssertion = parameters.assertion;

        
        let entity = {
            "id": requestTxnId,
            "type": "assertion"
        };

        entity = {...entity, ...inAssertion};

        const entityKey = `entity-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createAssertion",
                "entity": entity
            },
            [entityKey]: entity
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
                "master": parameters.key
            }
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

    getEntityObject: async function (options) {
        try {
            const objResponse = await this.client.getSmartContractObject({key:`entity-${options.entityId}`})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "Entity Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    }
}