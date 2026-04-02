const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');

router.post('/create', accountsController.createAccount);
router.post('/deposit', accountsController.deposit);
router.post('/withdraw', accountsController.withdraw);
router.get('/findAllTransactions', accountsController.findAllTransactions);
router.get('/', accountsController.getAllAccounts);
router.get('/:id', accountsController.getAccountById);
router.put('/:id', accountsController.updateAccount);
router.delete('/:id', accountsController.deleteAccount);

module.exports = router;
