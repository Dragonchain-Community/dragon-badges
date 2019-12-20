const util = require('util');
const dcsdk = require('dragonchain-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const helper = require('./dragon-badges-helper');

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

	app.use(helmet.noCache());

	app.use(cors());

    app.use(bodyParser.urlencoded({ extended: true, limit:'10mb' }))
    app.use(bodyParser.json({limit: '10mb'}));

	// Basic authentication middleware //
	app.use(async function (req, res, next) {

		/*
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
		  
		*/

		next();
	})
	
    
    /*
        ****NOTE: REMEMBER TO ADD ALL IDs AND REFERENCE IDs TO INDIVIDUAL OBJECT ENDPOINTS****
    */
	
	// Get all issuers //	
	app.get('/issuers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const issuers = await helper.getissuers(client);

		const issuerObjects = await Promise.all(issuers.map(async p => {return await helper.getHeapObject(client, {key: `issuer-${p.id}`})}));

        res.json(issuerObjects);
	}));	

	// Get a specific issuer //
	app.get('/issuers/:issuerId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const issuer = await helper.getHeapObject(client, {key: `issuer-${req.params.issuerId}`});

		const issuerImageObject = await helper.getHeapObject(client, {key: `image-${req.params.issuerId}`});

		issuer.imageURL = `${helper.config.urlPrefix}/image/${req.params.issuerId}.${issuerImageObject.extension}`;

		res.json(issuer);
	}));	

	// Create a new issuer //
	app.post('/issuers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let issuer = req.body.issuer;

		const requestTxn = await helper.createIssuer(client, {issuer: issuer});

		res.json(requestTxn);
	}));
	

	// Get all badge classes //	
	app.get('/badgeClasses', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const badgeClasses = await helper.getBadgeClasses(client);

		const badgeClassObjects = await Promise.all(badgeClasses.map(async p => {return await helper.getHeapObject(client, {key: `badgeClass-${p.id}`})}));

        res.json(badgeClassObjects);
	}));	

	// Get a specific badgeclass //
	app.get('/badgeClasses/:badgeClassId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const badgeClass = await helper.getHeapObject(client, {key: `badgeClass-${req.params.badgeClassId}`});

		res.json(badgeclass);
	}));	

	// Create a new badgeclass //
	app.post('/badgeClasses', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let badgeClass = req.body.badgeClass;

		const requestTxn = await helper.createBadgeClass(client, {badgeClass: badgeClass});

		res.json(requestTxn);
	}));
	


	// Get all signed assertions //	
	app.get('/signedAssertions', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const assertions = await helper.getAssertions(client);

		const assertionObjects = await Promise.all(assertions.map(async p => {return await helper.getHeapObject(client, {key: `assertion-${p.id}`})}));

        res.json(assertionObjects);
	}));	

	// Get a specific signed assertion //
	app.get('/signedAssertions/:assertionId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const assertion = await helper.getHeapObject(client, {key: `assertion-${req.params.badgeClassId}`});

		res.json(assertion);
	}));	

	// Create a new signed assertion //
	app.post('/signedAssertions', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let assertion = req.body.assertion;

		assertion.recipient = helper.getRecipientObjectFromEmail(req.body.email);

		const requestTxn = await helper.createSignedAssertion(client, {assertion: assertion, urlPrefix: helper.config.urlPrefix});

		res.json(requestTxn);
	}));


	// Get all hosted assertions //	
	app.get('/hostedAssertions', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();
		
		const assertions = await helper.getAssertions(client);

		const assertionObjects = await Promise.all(assertions.map(async p => {return await helper.getHeapObject(client, {key: `assertion-${p.id}`})}));

        res.json(assertionObjects);
	}));	

	// Get a specific hosted assertion //
	app.get('/hostedAssertions/:assertionId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const assertion = await helper.getHeapObject(client, {key: `assertion-${req.params.badgeClassId}`});

		res.json(assertion);
	}));	

	// Create a new hosted assertion //
	app.post('/hostedAssertions', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let assertion = req.body.assertion;

		assertion.recipient = helper.getRecipientObjectFromEmail(req.body.email);

		const requestTxn = await helper.createHostedAssertion(client, {assertion: assertion, urlPrefix: helper.config.urlPrefix});

		res.json(requestTxn);
	}));


	// +++++++++++ Open Badges-specific public endpoints +++++++++++++ //

	// Issuer //
	app.get('/issuer/:issuerId.json', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const issuerObject = await helper.getHeapObject(client, {key: `issuer-${req.params.issuerId}`});

		//const publicKeyObject = await helper.getHeapObject(client, {key: `publicKey-${issuerObject.entityId}`});

		//const revocationListObject = await helper.getHeapObject(client, {key: `revocationList-${issuerObject.entityId}`});

		const issuer = {
			"@context": "https://w3id.org/openbadges/v2",
			"id": `${helper.config.urlPrefix}/issuer/${issuerObject.entityId}.json`,
			"type": "Issuer",
			"name": issuerObject.name,
			"description": issuerObject.description,
			"url": issuerObject.url,
			"image": `${helper.config.urlPrefix}/image/${issuerObject.entityId}.json`,
			"publicKey": `${helper.config.urlPrefix}/publicKey/${issuerObject.entityId}.json`,
			"revocationList": `${helper.config.urlPrefix}/publicKey/${issuerObject.entityId}.json`
			
		}

		res.set("Content-Type", "application/ld+json").json(issuer);
	}));

	// Public Key //
	app.get('/publicKey/:issuerId.json', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const issuerObject = await helper.getHeapObject(client, {key: `issuer-${req.params.issuerId}`});

		const publicKeyObject = await helper.getHeapObject(client, {key: `publicKey-${issuerObject.entityId}`});

		const publicKey = {
			"@context": "https://w3id.org/openbadges/v2",							
			"id": `${helper.config.urlPrefix}/publicKey/${issuerObject.entityId}.json`,
			"type": "CryptographicKey",
			"owner": `${helper.config.urlPrefix}/issuer/${issuerObject.entityId}.json`,
			"publicKeyPem": publicKeyObject.publicKeyPem			
		}

		res.set("Content-Type", "application/ld+json").json(publicKey);
	}));

	// RevocationList //
	app.get('/revocationList/:issuerId.json', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const issuerObject = await helper.getHeapObject(client, {key: `issuer-${req.params.issuerId}`});

		const revocationListObject = await helper.getHeapObject(client, {key: `revocationList-${issuerObject.entityId}`});

		const revocationList = {
			"@context": "https://w3id.org/openbadges/v2",					
			"id": `${helper.config.urlPrefix}/revocationList/${issuerObject.entityId}.json`,
			"type": "RevocationList",
			"issuer": `${helper.config.urlPrefix}/issuer/${issuerObject.entityId}.json`,
			"revokedAssertions": revocationListObject.revokedAssertions
		}

		res.set("Content-Type", "application/ld+json").json(revocationList);
	}));

	// Badge Class //
	app.get('/badgeClass/:badgeClassId.json', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const badgeClassObject = await helper.getHeapObject(client, {key: `badgeClass-${req.params.badgeClassId}`});

		const issuerObject = await helper.getHeapObject(client, {key: `issuer-${badgeClassObject.issuerEntityId}`});

		/*
			"type": "BadgeClass",
            "name": "Member - Fellowship of the Order of Dragons",
            "description": "This badge is awarded to all members accepted to the Fellowship of the Order of Dragons.",
            "image": "https://api.dragondevices.com/image/a66da451-20a2-43bb-bcea-bab2790027e4.png",
            "criteria": {                
                "narrative": "To earn the **Fellowship Member Badge**, one must: \n\n 1. Be invited to the Fellowship of the Order of Dragons by a current member \n\n 2. Be accepted by the membership majority, and \n\n 3. Complete the requirements to become a member."
            }
		*/

		const badgeClass = {
			"@context": "https://w3id.org/openbadges/v2",			
			"id": `${helper.config.urlPrefix}/badgeClass/${badgeClassObject.entityId}.json`,
			"type": "BadgeClass",
			"name": badgeClassObject.name,
			"description": badgeClassObject.description,			
			"image": `${helper.config.urlPrefix}/image/${badgeClassObject.entityId}.json`,
			"criteria": badgeClassObject.criteria,
			"issuer": `${helper.config.urlPrefix}/issuer/${badgeClassObject.issuerEntityId}.json`
		}

		res.set("Content-Type", "application/ld+json").json(badgeClass);
	}));

	// Hosted Assertion //
	app.get('/hostedAssertion/:assertionId.json', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const assertionObject = await helper.getHeapObject(client, {key: `assertion-${req.params.assertionId}`});

		res.set("Content-Type", "application/ld+json").json(assertionObject);
	}));

	// Image //
	app.get('/image/:imageId.:extension', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const imageObject = await helper.getHeapObject(client, {key: `image-${req.params.imageId}`});

		const imageBuffer = Buffer.from(imageObject.data, "base64");

		res.writeHead(200, {
			'Content-Type': imageObject.contentType,
			'Content-Length': imageBuffer.length
		});

		res.end(imageBuffer);
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
	const server = app.listen(helper.config.port, () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}

main().then().catch(console.error)


