const util = require('util');
const crypto = require('crypto');

const config = require('./config');

// Escape a value for redisearch query purposes //
const redisearchEncode = (value) => {
    return value.replace(/([^A-Za-z\d_|]+)/g, '\\$1');
}

// General helper for interacting with our Dragonchain node using the SDK client //
const helper = {              
    
    getIssuers: async (client) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createIssuer}`,
                limit: 999999
            });

            if (transactions.response.results)
            {
                return transactions.response.results.map(result => {return result.payload.response.entity});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createIssuer: async (client, options) => {
        try {
            let payload = {
                "method":"createIssuer", 
                "parameters":{
                    "issuer": options.issuer
                }
            };

            const requestTxn = await client.createTransaction({
                transactionType: config.contractTxnType,
                payload: payload
            })

            return requestTxn;

        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },


    // +++ Heap Helpers +++ //
    getAPIKeyMapObject: async function (client) {
        try {
            const objResponse = await client.getSmartContractObject({key:`apiKeyMap`, smartContractId: config.contractId})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "API Keys Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getEntityObject: async function (client, options) {
        try {
            const objResponse = await client.getSmartContractObject({key:`entity-${options.entityId}`, smartContractId: config.contractId})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "Entity Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCustomerObjectAuthenticated: async function (client, options) {
        try {

            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createCustomer} @entity_email:{${redisearchEncode(options.email)}}`
            });

            let entity = null;
            if (transactions.response.total > 0)
            {
                entity = transactions.response.results[0].payload.response.entity;
            } else 
                throw `Invalid email or password.`;

            const objResponse = await client.getSmartContractObject({key:`entity-${entity.id}`, smartContractId: config.contractId})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "Invalid email or password.";

            if (!this.validateHashedPassword(options.password, obj.hashedPassword))
                throw "Invalid email or password.";

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCreditRecordObject: async function (client, options) {
        try {
            const objResponse = await client.getSmartContractObject({key:`creditRecord-${options.creditRecordId}`, smartContractId: config.contractId})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "Credit Record Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    },

    getCreditRecordCertificateFileObject: async function (client, options) {
        try {
            const objResponse = await client.getSmartContractObject({key: options.creditRecordCertificateFileKey, smartContractId: config.contractId})

            const obj = JSON.parse(objResponse.response);
            
            if (obj.error)
                throw "Credit Record Certificate File Not Found: " + obj.error.details;

            return obj;
        } catch (exception)
        {            
            throw exception
        }
    },

    // +++ Utility +++ //
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getRecipientObjectFromEmail: function (email) {
        let sum = crypto.createHash('sha256');
        
        const salt = crypto.randomBytes(16).toString('hex'); 
        
        sum.update(email + salt);

        return {
            "type": "email",
            "hashed": true,
            "salt": salt,
            "identity": `sha256$${sum.digest('hex')}`
        }
    },

    getHashedPassword: function (password) {

        const salt = crypto.randomBytes(16).toString('hex'); 

        const hashedPassword = {
            "salt": salt,
            "hash": crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)
        };
        
        return JSON.stringify(hashedPassword);
    },

    validateHashedPassword: function (password, hashedPasswordStr) {
        const hashedPassword = JSON.parse(hashedPasswordStr);

        const hash = crypto.pbkdf2Sync(password, hashedPassword.salt, 1000, 64, `sha512`).toString(`hex`);

        return hash == hashedPassword.hash;
    }
    
}

module.exports = helper;