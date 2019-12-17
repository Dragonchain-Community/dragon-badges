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

		const issuerObjects = await Promise.all(issuers.map(async p => {return await helper.getEntityObject(client, {entityId: p.id})}));

        res.json(issuerObjects);
	}));	

	// Get a specific issuer //
	app.get('/issuers/:issuerId', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const issuer = await helper.getHeapObject(client, {key: req.params.issuerId});

		res.json(issuer);
	}));	

	// Get a specific issuer profile in Open Badges format //
	app.get('/issuer/:issuerId.json', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		const issuer = await helper.getHeapObject(client, {key: req.params.issuerId});

		res.writeHead(200, {
			'Content-Type': 'application/ld+json'
		});

		res.json(issuer);
	}));


	// Create a new issuer //
	app.post('/issuers', awaitHandlerFactory(async (req, res) => {
		const client = await dcsdk.createClient();

		let issuer = req.body.issuer;

		const requestTxn = await helper.createissuer(client, {issuer: issuer});

		res.json(requestTxn);
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
	const server = app.listen(3050, () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}

main().then().catch(console.error)


