const util = require('util');
const crypto = require('crypto');

const config = require('./config');

// Escape a value for redisearch query purposes //
const redisearchEncode = (value) => {
    return value.replace(/([^A-Za-z\d_|]+)/g, '\\$1');
}

// General helper for interacting with our Dragonchain node using the SDK client //
const helper = {              
    
    getProviders: async (client) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createProvider}`,
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

    createProvider: async (client, options) => {
        try {
            let payload = {
                "method":"createProvider", 
                "parameters":{
                    "provider": options.provider
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

    getPartners: async (client) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createPartner}`,
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

    findPartnersInIndustries: async (client, options) => {
        try {

            const industryList = options.industries.split(",").join("|");

            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createPartner} @entity_industries:{${redisearchEncode(industryList)}}`
            });

            if (transactions.response.total > 0)
            {
                return transactions.response.results.map((e) => e.payload.response.entity);
            } else 
                throw `Partners not found with specified industries.`;


        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createPartner: async (client, options) => {
        try {
            let payload = {
                "method":"createPartner", 
                "parameters":{
                    "partner": options.partner
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

    getParticipants: async (client) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createParticipant}`,
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

    findParticipantByIdentifier: async (client, options) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createParticipant} @participant_provider_id:{${redisearchEncode(options.providerId)}} @participant_encrypted_customer_identifier:{${redisearchEncode(options.encryptedCustomerIdentifier)}}`
            });

            if (transactions.response.total > 0)
            {
                return transactions.response.results[0].payload.response.entity;
            } else 
                throw `Participant not found with specified provider Id and encrypted customer identifier.`;


        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createParticipant: async (client, options) => {
        try {
            let payload = {
                "method":"createParticipant", 
                "parameters":{
                    "participant": options.participant
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

    getCustomers: async (client) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createCustomer}`,
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

    createCustomer: async (client, options) => {
        try {
            let payload = {
                "method":"createCustomer", 
                "parameters":{
                    "customer": options.customer
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

    createCustomerParticipantRelationship: async (client, options) => {
        try {
            let payload = {
                "method":"createCustomerParticipantRelationship", 
                "parameters":{
                    "customerParticipantRelationship": options.customerParticipantRelationship
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

    getCreditRecords: async (client) => {
        try {
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{createCreditRecord}`,
                limit: 999999
            });

            if (transactions.response.results)
            {
                return transactions.response.results.map(result => {return result.payload.response.creditRecord});
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    createCreditRecord: async (client, options) => {
        try {
            let payload = {
                "method":"createCreditRecord", 
                "parameters":{
                    "creditRecord": options.creditRecord
                }
            };

            let request = {
                transactionType: config.contractTxnType,
                payload: payload
            };

            if (typeof options.callbackURL !== "undefine" && options.callbackURL != "")
                request.callbackURL = options.callbackURL;

            const requestTxn = await client.createTransaction(request);

            return requestTxn;

        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    transferPoints: async (client, options) => {
        try {
            let payload = {
                "method":"transferPoints", 
                "parameters":{
                    "pointTransfer": options.pointTransfer
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

    getPointTransferObjectsForEntities: async (client, options) => {
        try {            
            const transactions = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@response_type:{transferPoints} ((@transfer_points_from:{${redisearchEncode(options.entityList)}})|(@transfer_points_to:{${redisearchEncode(options.entityList)}}))`,
                limit: 999999,
                sortBy: 'timestamp',
                sortAscending: true
            });

            if (transactions.response.results)
            {
                return transactions.response.results.map(result => {
                    let transfer = result.payload.response.pointTransfer;

                    transfer.timestamp = result.header.timestamp;

                    return transfer;
                });
            } else 
                return [];
        } catch (exception)
        {
            // Pass back to caller to handle gracefully //
            throw exception;
        }
    },

    // +++ Dragon Net Verifications +++ //    
    getBlockVerificationsForTxnId: async(client, options) => {
        try {
            // Get the RESPONSE transaction for the transaction ID/object ID //
            const txnResponse = await client.queryTransactions({
                transactionType: config.contractTxnType,
                redisearchQuery: `@invoker:{${redisearchEncode(options.objectId)}}`,
                limit: 999999
            });

            if (txnResponse.response.results && txnResponse.response.results.length > 0)
            {                
                const verificationsResponse = await client.getVerifications({blockId:txnResponse.response.results[0].header.block_id});
            
                return verificationsResponse.response;
            } else {
                throw "Object not found.";
            }
        } catch (exception)
        {            
            throw exception
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