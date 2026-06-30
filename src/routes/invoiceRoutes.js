const router = require("express").Router();
const c = require("../controllers/invoiceController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.post("/", c.createInvoice);
router.get("/", c.getInvoices);
router.get("/:id", c.getInvoiceById);
module.exports = router;
