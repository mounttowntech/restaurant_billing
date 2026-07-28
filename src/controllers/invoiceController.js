const Invoice = require("../models/Invoice");


// ==========================================================
// Create Invoice
// ==========================================================

exports.createInvoice = async (req, res) => {

    try {

        const invoice = new Invoice({

            ...req.body,

            createdBy: req.user?.id,

        });


        const savedInvoice = await invoice.save();


        res.status(201).json({

            success:true,

            message:"Invoice created successfully",

            data:savedInvoice,

        });


    } catch(error){

        res.status(500).json({

            success:false,

            message:"Failed to create invoice",

            error:error.message,

        });

    }

};




// ==========================================================
// Get All Invoices
// ==========================================================

exports.getInvoices = async(req,res)=>{

    try{


        const invoices = await Invoice.find()

        .populate("customer","name mobile")

        .populate("store","storeName")

        .populate("cashier","name")

        .sort({
            createdAt:-1
        });



        res.status(200).json({

            success:true,

            count:invoices.length,

            data:invoices,

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message,

        });

    }

};




// ==========================================================
// Get Invoice By ID
// ==========================================================

exports.getInvoiceById = async(req,res)=>{

    try{


        const invoice = await Invoice.findById(req.params.id)

        .populate("customer")

        .populate("store")

        .populate("items.menuItem")

        .populate("cashier");


        if(!invoice){

            return res.status(404).json({

                success:false,

                message:"Invoice not found",

            });

        }


        res.json({

            success:true,

            data:invoice,

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message,

        });

    }

};




// ==========================================================
// Update Invoice
// ==========================================================

exports.updateInvoice = async(req,res)=>{


try{


    const invoice = await Invoice.findById(req.params.id);


    if(!invoice){

        return res.status(404).json({

            success:false,

            message:"Invoice not found",

        });

    }



    Object.assign(invoice,req.body);


    invoice.updatedBy=req.user?.id;


    await invoice.save();



    res.json({

        success:true,

        message:"Invoice updated successfully",

        data:invoice,

    });



}catch(error){

    res.status(500).json({

        success:false,

        message:error.message,

    });

}


};





// ==========================================================
// Soft Delete Invoice
// ==========================================================

exports.deleteInvoice = async(req,res)=>{

try{


const invoice = await Invoice.findById(req.params.id);


if(!invoice){

return res.status(404).json({

success:false,

message:"Invoice not found"

});

}


await invoice.softDelete(req.user.id);



res.json({

success:true,

message:"Invoice deleted successfully"

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};






// ==========================================================
// Mark Invoice Paid
// ==========================================================

exports.markPaid = async(req,res)=>{


try{


const invoice = await Invoice.findById(req.params.id);


if(!invoice){

return res.status(404).json({

success:false,

message:"Invoice not found"

});

}



await invoice.markPaid(

req.body.paymentMethod,

req.body.transactionId

);



res.json({

success:true,

message:"Invoice marked as paid",

data:invoice

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};






// ==========================================================
// Cancel Invoice
// ==========================================================

exports.cancelInvoice = async(req,res)=>{


try{


const invoice = await Invoice.findById(req.params.id);


await invoice.cancelInvoice(

req.body.remarks

);



res.json({

success:true,

message:"Invoice cancelled successfully"

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};







// ==========================================================
// Refund Invoice
// ==========================================================

exports.refundInvoice = async(req,res)=>{


try{


const invoice = await Invoice.findById(req.params.id);


await invoice.markRefunded();



res.json({

success:true,

message:"Invoice refunded successfully"

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};







// ==========================================================
// Restore Invoice
// ==========================================================

exports.restoreInvoice = async(req,res)=>{


try{


const invoice = await Invoice.findById(req.params.id);


await invoice.restore();



res.json({

success:true,

message:"Invoice restored successfully"

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};







// ==========================================================
// Today's Sales
// ==========================================================

exports.getTodaySales = async(req,res)=>{


try{


const data =
await Invoice.getTodaySales();



res.json({

success:true,

data

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};







// ==========================================================
// Pending Invoice
// ==========================================================

exports.getPendingInvoices = async(req,res)=>{


try{


const data =
await Invoice.getPendingInvoices();



res.json({

success:true,

data

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};







// ==========================================================
// Daily Collection
// ==========================================================

exports.getDailyCollection = async(req,res)=>{


try{


const data =
await Invoice.getDailyCollection(
req.query.date
);



res.json({

success:true,

data

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};







// ==========================================================
// Store Sales
// ==========================================================

exports.getStoreSales = async(req,res)=>{


try{


const data =
await Invoice.getStoreSales(
req.params.storeId
);



res.json({

success:true,

data

});



}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}


};