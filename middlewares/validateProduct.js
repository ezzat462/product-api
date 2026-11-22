
const { param, validationResult } = require('express-validator');
const validateProductID= async(req, res, next) => {
   await  param('id').isInt({ min: 1 }.run);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }       
    next();
};
module.exports = validateProductID;