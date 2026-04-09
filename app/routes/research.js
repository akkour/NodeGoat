const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

// Fix for CWE-918 - SSRF: allowlist of permitted API hosts
const ALLOWED_HOSTS = [
    "http://finance.yahoo.com",
    "https://finance.yahoo.com",
    "http://www.yahoo.com",
    "https://www.yahoo.com"
];

// Fix for CWE-79 - XSS: use standard escape-html library instead of hand-rolled function
const escapeHtml = require("escape-html");

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            const url = String(req.query.url);
            const symbol = String(req.query.symbol);

            // Fix for CWE-918 - SSRF: validate URL against allowlist
            const isAllowed = ALLOWED_HOSTS.some((host) => url.startsWith(host));
            if (!isAllowed) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Error: URL not allowed. Only approved financial APIs are permitted.</h1>");
                return res.end();
            }

            // Sanitize symbol to alphanumeric characters only
            const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9.]/g, "");

            return needle.get(url + sanitizedSymbol, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    // Fix for CWE-79 - XSS: escape response body before rendering
                    res.write(escapeHtml(body));
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
