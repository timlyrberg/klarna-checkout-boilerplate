function getKlarnaAuth() {
    const username = process.env.publicKey;
    const password = process.env.secretKey;
    const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    return auth;
}


module.exports = {getKlarnaAuth};