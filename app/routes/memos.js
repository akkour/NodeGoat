const MemosDAO = require("../data/memos-dao").MemosDAO;
const {
    environmentalScripts
} = require("../../config/config");

// Fix for CWE-79 - XSS: escape HTML entities in memo content
const escapeHtml = (str) => {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
};

function MemosHandler(db) {
    "use strict";

    const memosDAO = new MemosDAO(db);

    this.addMemos = (req, res, next) => {

        const memo = String(req.body.memo);
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
