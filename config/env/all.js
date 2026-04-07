// default app configuration
const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

module.exports = {
    port,
    db,
    // Fix for CWE-798 - session secret must be provided via environment variable
    cookieSecret: process.env.SESSION_SECRET || (() => { throw new Error("SESSION_SECRET environment variable is required"); })(),
    // Fix for CWE-798 - crypto key must be provided via environment variable
    cryptoKey: process.env.CRYPTO_KEY || (() => { throw new Error("CRYPTO_KEY environment variable is required"); })(),
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};

