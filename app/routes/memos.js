const MemosDAO = require("../data/memos-dao").MemosDAO;
const {
    environmentalScripts
} = require("../../config/config");
// Fix for CWE-79 - XSS: use standard escape-html library instead of hand-rolled function
const escapeHtml = require("escape-html");
// Fix for CWE-943 - NoSQL Injection: defense-in-depth sanitization
const mongoSanitize = require("mongo-sanitize");

function MemosHandler(db) {
    "use strict";

    const memosDAO = new MemosDAO(db);

    this.addMemos = (req, res, next) => {

        const memo = String(mongoSanitize(req.body.memo));
        memosDAO.insert(memo, (err, docs) => {
            if (err) return next(err);
            this.displayMemos(req, res, next);
        });
    };

    this.displayMemos = (req, res, next) => {

        const {
            userId
        } = req.session;

        memosDAO.getAllMemos((err, docs) => {
            if (err) return next(err);
            // Fix for CWE-79 - XSS: sanitize memo content before rendering
            const sanitizedDocs = docs.map(doc => ({
                ...doc,
                memo: escapeHtml(doc.memo)
            }));
            return res.render("memos", {
                memosList: sanitizedDocs,
                userId: userId,
                environmentalScripts
            });
        });
    };

}

module.exports = MemosHandler;
