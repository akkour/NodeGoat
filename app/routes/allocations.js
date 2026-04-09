const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;
const {
    environmentalScripts
} = require("../../config/config");
// Fix for CWE-943 - NoSQL Injection: defense-in-depth sanitization
const mongoSanitize = require("mongo-sanitize");

function AllocationsHandler(db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        // Fix for CWE-639 - IDOR: use session userId instead of URL param
        const userId = String(req.session.userId);
        const threshold = Number(mongoSanitize(req.query.threshold));

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", {
                userId,
                allocations,
                environmentalScripts
            });
        });
    };
}

module.exports = AllocationsHandler;
