const router = require("express").Router();
const c = require("../controllers/invoiceController");

router.post("/", c.createInvoice);
router.get("/", c.getInvoices);
router.get("/:id", c.getInvoiceById);
module.exports = router;
