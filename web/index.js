const express = require('express');
const exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
const rp = require('request-promise');
const cryptojs = require('crypto-js');
const fileUpload = require('express-fileupload');

const app = express();
app.use(cookieParser());

// Utility
const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
	
	let config = require('./config.json');

	config.auth = Buffer.from(`${config.apiId}:${config.apiKey}`).toString("base64");
    
    var hbs = exphbs.create({
		helpers: {
			json: function (context) {return JSON.stringify(context);},
			jsonPretty: function (context) {return JSON.stringify(context, null, 2);},
			list: function(context, options) {
				var ret = "";
			  
				for (var i = 0, j = context.length; i < j; i++) {
				  ret = ret + options.fn(context[i]);
				}
			  
				return ret;
			}
		}
	});

	app.engine('handlebars', hbs.engine);
	app.set('view engine', 'handlebars');

	app.use(fileUpload());
	app.use(express.urlencoded({ extended: true }))
	app.use('/public',  express.static(__dirname + '/public'));		
	app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

	app.get('/', awaitHandlerFactory(async (req, res) => {

		const issuers = await rp({
			uri: `${config.apiURL}/issuers/`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			json: true
		});

		res.render('index', {title: "Dragon Badges", issuers: issuers});
	}));

	app.get('/AddIssuer', awaitHandlerFactory(async (req, res) => {
		res.render('addissuer', {title: "Add a Badge Issuer"});
	}));

	app.post('/AddIssuer', awaitHandlerFactory(async (req, res) => {
		
		if (!req.files || Object.keys(req.files).length === 0) 
			return res.status(400).send('No logo file was uploaded.');
		
		if (req.files.image.mimetype != "image/png" && req.files.image.mimetype != "image/jpeg" && req.files.image.mimetype != "image/svg+xml")
			return res.status(400).send("Invalid image type.");

		if (req.files.image.size / 1024 > 258)
			return res.status(400).send("Image is too large (max allowable size 256KB).");
		
		let extension = null;
		if (req.files.image.mimetype == "image/png")
			extension = "png";
		else if (req.files.image.mimetype == "image/jpeg")
			extension = "jpeg";
		else if (req.files.image.mimetype == "image/svg+xml")
			extension = "svg";



		const imageObject = {
			"extension": extension,
			"contentType": req.files.image.mimetype,
			"data": req.files.image.data.toString("base64")              
		  }          

		const options = {
			method: 'POST',
			uri: `${config.apiURL}/issuers/`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			body: {
				issuer: {
					"name": req.body.name,
					"description": req.body.description,
					"url": req.body.url,
					"imageObject": imageObject			
				}
			},
			json: true 
		};
		
		const result = await rp(options);

		await sleep(6000);

		res.redirect(`/Issuer/${result.response.transaction_id}`);
	}));

	app.get('/Issuer/:issuerId', awaitHandlerFactory(async (req, res) => {

		const issuer = await rp({
			uri: `${config.apiURL}/issuers/${req.params.issuerId}`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			json: true
		});		

		const badgeClasses = await rp({
			uri: `${config.apiURL}/issuers/${req.params.issuerId}/badgeClasses`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			json: true
		});		

		for (var i=0; i<badgeClasses.length; i++)
			badgeClasses[i].imageURLPrefix = config.apiURL;

		res.render('issuer', {title: "Dragon Badges Issuer", issuer: issuer, badgeClasses: badgeClasses, imageURLPrefix: config.apiURL});
	}));


	app.get('/AddBadgeClass/:issuerEntityId', awaitHandlerFactory(async (req, res) => {
		res.render('addbadgeclass', {title: "Add a Badge Class"});
	}));

	app.post('/AddBadgeClass/:issuerEntityId', awaitHandlerFactory(async (req, res) => {
		
		if (!req.files || Object.keys(req.files).length === 0) 
			return res.status(400).send('No image file was uploaded.');
		
		if (req.files.image.mimetype != "image/png" && req.files.image.mimetype != "image/svg+xml")
			return res.status(400).send("Invalid image type (png and svg only).");

		if (req.files.image.size / 1024 > 258)
			return res.status(400).send("Image is too large (max allowable size 256KB).");
		
		let extension = null;
		if (req.files.image.mimetype == "image/png")
			extension = "png";		
		else if (req.files.image.mimetype == "image/svg+xml")
			extension = "svg";


		const imageObject = {
			"extension": extension,
			"contentType": req.files.image.mimetype,
			"data": req.files.image.data.toString("base64")              
		  }          

		const options = {
			method: 'POST',
			uri: `${config.apiURL}/badgeClasses/`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			body: {
				badgeClass: {
					"issuerEntityId": req.params.issuerEntityId,
					"name": req.body.name,
					"description": req.body.description,	
					"criteria": {
						"narrative": req.body.criteriaNarrative
					},
					"imageObject": imageObject			
				}
			},
			json: true 
		};
		
		const result = await rp(options);

		await sleep(6000);

		res.redirect(`/BadgeClass/${result.response.transaction_id}`);
	}));

	app.get('/BadgeClass/:badgeClassId', awaitHandlerFactory(async (req, res) => {

		const badgeClass = await rp({
			uri: `${config.apiURL}/badgeClasses/${req.params.badgeClassId}`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			json: true
		});		

		res.render('badgeclass', {title: "Dragon Badges Badge Class", badgeClass: badgeClass, imageURLPrefix: config.apiURL});
	}));
	

	app.get('/AwardBadge/:badgeClassId', awaitHandlerFactory(async (req, res) => {

		const badgeClass = await rp({
			uri: `${config.apiURL}/badgeClasses/${req.params.badgeClassId}`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			json: true
		});		

		res.render('awardbadge', {title: "Award a Badge", badgeClass: badgeClass, imageURLPrefix: config.apiURL});
	}));

	app.post('/AwardBadge/:badgeClassId', awaitHandlerFactory(async (req, res) => {

		const options = {
			method: 'POST',
			uri: `${config.apiURL}/signedAssertions/`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			body: {				
				"assertion": {			
					"badgeClassEntityId": req.params.badgeClassId,
					"issuedOn": new Date().toISOString()
				},
				"email": req.body.recipientEmail				
			},
			json: true 
		};
		
		const result = await rp(options);

		await sleep(6000);

		res.redirect(`/SignedAssertion/${result.response.transaction_id}`);
	}));

	app.get('/SignedAssertion/:assertionId', awaitHandlerFactory(async (req, res) => {

		const signedAssertion = await rp({
			uri: `${config.apiURL}/signedAssertions/${req.params.assertionId}`,
			headers: {
				"Authorization": `Basic ${config.auth}`
			},
			json: true
		});		

		res.render('signedassertion', {title: "Dragon Badges Signed Assertion", assertion: signedAssertion});
	}));

    app.use(function (err, req, res, next) {
        console.log(err);

        res.render('error', {
            title: "Dragon Badges Error",
            error: err,
            layout: "simple.handlebars"
        });
    });

	// In production (optionally) use port 80 or, if SSL available, use port 443 //
	const server = app.listen(3025, () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}

main().then().catch(console.error)