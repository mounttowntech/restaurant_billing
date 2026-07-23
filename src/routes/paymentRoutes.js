const router=require('express').Router();
const c=require('../controllers/paymentController');

router.post('/',c.createPayment);
router.get('/',c.getPayments);
router.get('/:id',c.getPaymentById);
router.put('/:id',c.updatePayment);
router.delete('/:id',c.deletePayment);
module.exports=router;
