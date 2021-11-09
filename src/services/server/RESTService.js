const http = require('http');
const https = require('https');


class RESTService {
    static getJSON(requestOptions, onResult) {
        const port = requestOptions.port == 443 ? https : http;

        // console.log('requestOptions:', requestOptions);

        let output = '';
        requestOptions.path = requestOptions.path.trim();

        const req = port.request(requestOptions, (res) => {
            console.log(`Host: ${requestOptions.host} ,Response: ${res.statusCode}`);
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                output += chunk;
            });
            req.on('error', error => {
                console.error('23', error);
                onResult(400, obj);
            });
            res.on('end', () => {
                let obj;
                try {
                    obj = JSON.parse(output);
                } catch {
                    obj = output;
                }
                onResult(res.statusCode, obj);
            });
        });

        req.on('error', (err) => {
            console.error('39', err);
            // res.send('error: ' + err.message);
        });

        if (requestOptions.body) {
            req.write(requestOptions.body); // Used in POST req
        }
        req.end();
    };
}

export default RESTService;