# Dragon Badges Web Server

## Configuration

To generate the configuration file for the web server containing the unique salt for encryption/decryption of cookie data, run the following:

```node generate-config.js```

Then, after installing the smart contract and initializing it using the instructions in the API section, replace the **API Key** in `config.json`

## Startup

To run the web demo server:

```node index.js```

or in development mode:

```npm start```

The server is configured to run at `http://127.0.0.1:3025` by default.

*Note: the server actually binds to ALL available interfaces/IPs that it can by default.*