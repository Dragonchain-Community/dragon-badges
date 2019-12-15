const util = require('util');
const dcsdk = require('dragonchain-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const helper = require('./ceblocks-helper');

const app = express();

const main = async() => {
	const awaitHandlerFactory = (middleware) => {
		return async (req, res, next) => {
			try {
				await middleware(req, res, next)
			} catch (err) {
				next(err)
			}
		}
	}

    app.use(helmet());

	app.use(cors());

    app.use(bodyParser.urlencoded({ extended: true, limit:'10mb' }))
    app.use(bodyParser.json({limit: '10mb'}));

	// Basic authentication middleware //
	app.use(async function (req, res, next) {

        // check for basic auth header
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return res.status(401).json({ message: 'Missing Authorization Header' });
		}
	
		// verify auth credentials
		const base64Credentials =  req.headers.authorization.split(' ')[1];
		const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
		const [username, secret] = credentials.split(':');
        
        const client = await dcsdk.createClient();

        const apiKeyMap = await helper.getAPIKeyMapObject(client);
        
        if (typeof apiKeyMap[username] === "undefined" || !helper.validateHashedPassword(secret, apiKeyMap[username]))
            return res.status(401).json({ message: 'Invalid Authentication Credentials' });	
            
		next();
	})
	
	// Get all providers //
	app.get('/providers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const providers = await helper.getProviders(client);

		const providerObjects = await Promise.all(providers.map(async p => {return await helper.getEntityObject(client, {entityId: p.id})}));

        res.json(providerObjects);
	}));	

	// Get a specific provider //
	app.get('/providers/:providerId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const provider = await helper.getEntityObject(client, {entityId: req.params.providerId});

		res.json(provider);
	}));	


	// Create a new provider //
	app.post('/providers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let provider = req.body.provider;

		const requestTxn = await helper.createProvider(client, {provider: provider});

		res.json(requestTxn);
    }));

    // Get all partners //
	app.get('/partners', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const partners = await helper.getPartners(client);

		const partnerObjects = await Promise.all(partners.map(async p => {return await helper.getEntityObject(client, {entityId: p.id})}));

        res.json(partnerObjects);
	}));	

	// Get a specific partner //
	app.get('/partners/:partnerId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const partner = await helper.getEntityObject(client, {entityId: req.params.partnerId});

		res.json(partner);
    }));	
    
    // Get partners by industries //
    app.get('/partners/industries/:industries', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const partners = await helper.findPartnersInIndustries(client, {industries: req.params.industries});

		const partnerObjects = await Promise.all(partners.map(async p => {return await helper.getEntityObject(client, {entityId: p.id})}));

        res.json(partnerObjects);
	}));	


	// Create a new partner //
	app.post('/partners', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let partner = req.body.partner;

		const requestTxn = await helper.createPartner(client, {partner: partner});

		res.json(requestTxn);
    }));


    // Get all participants //
	app.get('/participants', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const participants = await helper.getParticipants(client);

		const participantObjects = await Promise.all(participants.map(async p => {return await helper.getEntityObject(client, {entityId: p.id})}));

        res.json(participantObjects);
    }));	
    
    // Get a specific participant by providerId and encrypted customer identifier //
	app.get('/participants/:providerId/:encryptedCustomerIdentifier', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        try {
            const participantTransactionRecord = await helper.findParticipantByIdentifier(client, {providerId: req.params.providerId, encryptedCustomerIdentifier: req.params.encryptedCustomerIdentifier});
            
            const participant = await helper.getEntityObject(client, {entityId: participantTransactionRecord.id})

            res.json(participant);

        } catch (exception) {
            throw "Participant not found.";
        }        		
	}));
    
    // Get a specific participant //
	app.get('/participants/:participantId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const participant = await helper.getEntityObject(client, {entityId: req.params.participantId});

		res.json(participant);
	}));	


	// Create a new participant //
	app.post('/participants', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        let participant = req.body.participant;
        
        // Make sure provider doesn't already have a participant with this encrypted identifier //


		const requestTxn = await helper.createParticipant(client, {participant: participant});

		res.json(requestTxn);
    }));

    // Get all customers //
	app.get('/customers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const customers = await helper.getCustomers(client);

		const customerObjects = await Promise.all(customers.map(async c => {return await helper.getEntityObject(client, {entityId: c.id})}));

        res.json(customerObjects);
    }));
    
    // Get a customer's full details //
    // +++ TODO: Secure this method with different auth credentials (JWT) to identify the actual user +++
    app.get('/customers/details/:customerId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
        let customer = await helper.getEntityObject(client, {entityId: req.params.customerId});
        
        // Get all participant objects (SUPER SLOW) //
        // +++ TODO: Replace with multi-object heap pull +++ //
        customer.participants = await Promise.all(customer.participantIds.map(async p => {

            let participant = await helper.getEntityObject(client, {entityId: p})

            // Attach the PROVIDER object //
            // +++ TODO: Separate from this map and pull by list of provider IDs when multi-pull available +++ //
            participant.provider = await helper.getEntityObject(client, {entityId: participant.providerId});

            // Attach all credit record objects // 
            // +++ TODO: Separate this, too! +++
            participant.creditRecords = await Promise.all(participant.creditRecordIds.map(async c => {return await helper.getCreditRecordObject(client, {creditRecordId: c})}));

            return participant;
        }));

        // Get all point transfers  //
        let entities = customer.participants.map(p => {return p.id}); 

        entities.push(customer.id);
        
        const fullEntityList = entities.join("|");

        customer.pointTransfers = await helper.getPointTransferObjectsForEntities(client, {entityList: fullEntityList});

        res.json(customer);
    }));

    // Get a specific customer by email and hashed password //
	app.post('/authenticateCustomer', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const customer = await helper.getCustomerObjectAuthenticated(client, {email: req.body.email, password: req.body.password});

		res.json(customer);
	}));
    
    // Create a new customer //
	app.post('/customers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        let customer = req.body.customer;

		const requestTxn = await helper.createCustomer(client, {customer: customer});

		res.json(requestTxn);
	}));

    // Create a new customer/participant relationship //
	app.post('/customers/participant', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        let customerParticipantRelationship = req.body.customerParticipantRelationship;

        const participant = await helper.getEntityObject(client, {entityId: customerParticipantRelationship.participantId})

        if (participant.encryptedCustomerIdentifier != customerParticipantRelationship.encryptedCustomerIdentifier)
            throw "Invalid encrypted access id.";

		const requestTxn = await helper.createCustomerParticipantRelationship(client, {customerParticipantRelationship: customerParticipantRelationship});

		res.json(requestTxn);
    }));
    
    // Create a new customer AND create a participant relationship //
	app.post('/customers/fromCreditRecord', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        const creditRecord = await helper.getCreditRecordObject(client, {creditRecordId: req.body.creditRecordId});

        if (creditRecord.encryptedCustomerIdentifier != req.body.encryptedCustomerIdentifier)
            throw "Incorrect encrypted access id";

        let customer = {
            "email": req.body.email,
            "hashedPassword": helper.getHashedPassword(req.body.password),
            "firstName": creditRecord.participantDetails.firstName,
            "middleName": creditRecord.participantDetails.middleName,
            "lastName": creditRecord.participantDetails.lastName,
            "lastNameSuffix": creditRecord.participantDetails.lastNameSuffix
        };

        const requestTxn = await helper.createCustomer(client, {customer: customer});
        
        await helper.sleep(6000); // Make sure we wait for the block to be written before continuing //

        const customerParticipantRelationship = {            
            "customerId": requestTxn.response.transaction_id,
            "participantId": creditRecord.participantId,
            "encryptedCustomerIdentifier": creditRecord.encryptedCustomerIdentifier            
        };

        const relRequestTxn = await helper.createCustomerParticipantRelationship(client, {customerParticipantRelationship: customerParticipantRelationship});

		res.json(requestTxn);
	}));

    // Get all credit records //
	app.get('/credit-records', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const creditRecords = await helper.getCreditRecords(client);

		const creditRecordObjects = await Promise.all(creditRecords.map(async c => {return await helper.getCreditRecordObject(client, {creditRecordId: c.id})}));

        res.json(creditRecordObjects);
    }));	

    // Get a specific credit record //
	app.get('/credit-records/:creditRecordId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const creditRecord = await helper.getCreditRecordObject(client, {creditRecordId: req.params.creditRecordId});

		res.json(creditRecord);
	}));

    // Create a credit record by encrypted customer identifier //
    app.post('/credit-records/by-customer-identifier', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        let creditRecord = req.body.creditRecord;
        
        const provider = await helper.getEntityObject(client, {entityId: creditRecord.providerId});

        // Look up participant ID if available //
        let participantId = null;

        try {
            participantTransactionRecord = await helper.findParticipantByIdentifier(client, {providerId: creditRecord.providerId, encryptedCustomerIdentifier: creditRecord.encryptedCustomerIdentifier});

            participantId = participantTransactionRecord.id;

        } catch (exception)
        {
            const newParticipantRequestTxn = await helper.createParticipant(client, {
                participant: {
                    "providerId": creditRecord.providerId,
                    "encryptedCustomerIdentifier": creditRecord.encryptedCustomerIdentifier
                }
            });

            participantId = newParticipantRequestTxn.response.transaction_id;

            await helper.sleep(6000); // Make sure we wait for the block to be written before continuing //
        }

        creditRecord.participantId = participantId;

        // Transfer the points //
        const points = creditRecord.eventCredits * provider.creditToPointsMultiplier;

        const ptRequestTxn = await helper.transferPoints(client, {            
            pointTransfer: {
                "fromEntityId": creditRecord.providerId, 
                "toEntityId": creditRecord.participantId, 
                "points": points,
                "memo": `Rewards earned from provider ${provider.name}`
            }
        });

        creditRecord.pointTransfer = {
            "id": ptRequestTxn.response.transaction_id,
            "pointsAwarded": points
        };

        // Create the credit record //
		const requestTxn = await helper.createCreditRecord(client, {creditRecord: creditRecord, callbackURL: provider.addCreditRecordCallbackURL});

        
		res.json(requestTxn);
	}));

	// Create a credit record //
    app.post('/credit-records/', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        let creditRecord = req.body.creditRecord;
        
        const provider = await helper.getEntityObject(client, {entityId: creditRecord.providerId});

        const participant = await helper.getEntityObject(client, {entityId: creditRecord.participantId});

        creditRecord.encryptedCustomerIdentifier = participant.encryptedCustomerIdentifier;

        // Transfer the points //
        const points = creditRecord.eventCredits * provider.creditToPointsMultiplier;

        const ptRequestTxn = await helper.transferPoints(client, {            
            pointTransfer: {
                "fromEntityId": creditRecord.providerId, 
                "toEntityId": creditRecord.participantId, 
                "points": points
            }
        });

        creditRecord.pointTransfer = {
            "id": ptRequestTxn.response.transaction_id,
            "pointsAwarded": points
        };

        // Create the credit record //
		const requestTxn = await helper.createCreditRecord(client, {creditRecord: creditRecord, callbackURL: provider.addCreditRecordCallbackURL});

		res.json(requestTxn);
    }));

    // Get a certificate file's data //
	app.get('/certificate-file/:creditRecordCertificateFileKey', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        const creditRecordCertificateFileObj = await helper.getCreditRecordCertificateFileObject(client, {creditRecordCertificateFileKey: req.params.creditRecordCertificateFileKey});
        
		res.json({data: creditRecordCertificateFileObj});
	}));

    
    // REDEEM points (provider-controlled, burns points for participant) //
	app.post('/redeem-points', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        // Make sure provider owns participant record //
        const participant = await helper.getEntityObject(client, {entityId: req.body.participantId});

        const provider = await helper.getEntityObject(client, {entityId: participant.providerId});

        if (participant.providerId != req.body.providerId)
            throw "Invalid participant specified for redemption.";

        if (req.body.points > participant.points)        
            throw "The participant has an insufficient balance to redeem the specified amount.";
        
		const requestTxn = await helper.transferPoints(client, {            
            pointTransfer: {
                "fromEntityId": req.body.participantId,
                "toEntityId": null, 
                "points": req.body.points,
                "memo": `Redemption at provider ${provider.name}`
            }
        });

		res.json(requestTxn);
    }));
    
    // REDEEM points (provider-controlled, burns points for participant) //
	app.post('/redeem-marketplace', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

        // Get the customer object //
        const customer = await helper.getEntityObject(client, {entityId: req.body.redemption.customerId});
        
        // Get the participant objects //
        const participants = await Promise.all(customer.participantIds.map(async p => {return await helper.getEntityObject(client, {entityId: p})}));

        let tokenBalance = customer.points;

        let redeemingEntities = [{"entityId": customer.id, "pointsAvailable": customer.points}];

		for (let i=0; i < participants.length; i++)
		{
            tokenBalance += participants[i].points;
            redeemingEntities.push({"id": participants[i].id, "pointsAvailable": participants[i].points});
        }
        
        // Should be points on the actual offer, not passed through request
        if (tokenBalance < req.body.redemption.points)
            throw "Insufficient balance.";

        let pointsLeft = req.body.redemption.points;
        let i = 0;
        while (pointsLeft > 0)
        {
            entity = redeemingEntities[i];

            if (entity.pointsAvailable <= 0)
            {
                i++;
                continue;
            }

            let pointsToTransfer = 0;
            if (entity.pointsAvailable > pointsLeft)
                pointsToTransfer = pointsLeft;
            else 
                pointsToTransfer = entity.pointsAvailable;

            await helper.transferPoints(client, {            
                pointTransfer: {
                    "fromEntityId": entity.id,
                    "toEntityId": null, 
                    "points": pointsToTransfer,
                    "memo": req.body.redemption.memo
                }
            });

            pointsLeft = pointsLeft - pointsToTransfer;
            i++;            
        }

        await helper.sleep(6000);

		res.json({success: true});
	}));
    

    // Get an object's Dragon Net verifications //
	app.get('/verifications/:objectId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const verifications = await helper.getBlockVerificationsForTxnId(client, {objectId: req.params.objectId});

		res.json(verifications);
	}));

	// Error handling //
	app.use(function (err, req, res, next) {
		console.error(err);

		res.status(400).json({ message: err });
	});

	// In production (optionally) use port 80 or, if SSL available, use port 443 //
	const server = app.listen(3030, () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}

main().then().catch(console.error)


