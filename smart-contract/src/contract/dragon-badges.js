'use strict'
const uuid = require("uuid/v4");

module.exports = {
    // Dragonchain SDK client instance //
    client: null,

    config: {
        apiEndpointURL: null,
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
            "id": requestTxnId,
            "type": "issuer",
            "profile": {
                "type": "Issuer"                
            }
            
        };

        entity.profile = {...entity.profile, ...inIssuer};

        const entityKey = `entity-${requestTxnId}`;

        let output = {
            "response": {
                "type": "createIssuer",
                "entity": entity
            },
            [entityKey]: entity
        }

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
    },

    
}