const KOT = require("../models/KOT");


// ==========================================================
// Create KOT
// ==========================================================

exports.createKOT = async (req, res) => {

    try {

        const kot = await KOT.create({
            ...req.body,
            createdBy: req.user?.id,
        });


        res.status(201).json({
            success:true,
            message:"KOT created successfully",
            data:kot
        });


    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Get All KOT
// ==========================================================

exports.getAllKOT = async(req,res)=>{

    try{

        const kots = await KOT.find()
        .populate("order")
        .populate("table")
        .populate("chef")
        .populate("waiter")
        .sort({
            createdAt:-1
        });


        res.json({
            success:true,
            count:kots.length,
            data:kots
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Get KOT By ID
// ==========================================================

exports.getKOTById = async(req,res)=>{

    try{

        const kot = await KOT.findById(req.params.id)
        .populate("order")
        .populate("table")
        .populate("chef")
        .populate("waiter");


        if(!kot)
        {
            return res.status(404).json({
                success:false,
                message:"KOT not found"
            });
        }


        res.json({
            success:true,
            data:kot
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Update KOT
// ==========================================================

exports.updateKOT = async(req,res)=>{

    try{


        const kot = await KOT.findByIdAndUpdate(

            req.params.id,

            {
                ...req.body,
                updatedBy:req.user?.id
            },

            {
                new:true,
                runValidators:true
            }

        );


        res.json({

            success:true,
            message:"KOT updated successfully",
            data:kot

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Delete KOT
// ==========================================================

exports.deleteKOT = async(req,res)=>{

    try{

        const kot = await KOT.findById(req.params.id);


        if(!kot){

            return res.status(404).json({
                success:false,
                message:"KOT not found"
            });

        }


        await kot.softDelete(
            req.user?.id
        );


        res.json({

            success:true,
            message:"KOT deleted successfully"

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Restore KOT
// ==========================================================

// ==========================================================
// Restore KOT
// ==========================================================

exports.restoreKOT = async (req, res) => {
  try {
    const kot = await KOT.findOne({
      _id: req.params.id,
      isDeleted: true
    });

    if (!kot) {
      return res.status(404).json({
        success: false,
        message: "Deleted KOT not found"
      });
    }

    await kot.restore();

    res.status(200).json({
      success: true,
      message: "KOT restored successfully",
      data: kot
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==========================================================
// Mark Preparing
// ==========================================================

exports.markPreparing = async(req,res)=>{

    try{

        const kot = await KOT.findById(req.params.id);


        await kot.markPreparing();


        res.json({

            success:true,
            message:"KOT moved to Preparing",
            data:kot

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Mark Ready
// ==========================================================

exports.markReady = async(req,res)=>{

    try{

        const kot = await KOT.findById(req.params.id);


        await kot.markReady();


        res.json({

            success:true,
            message:"KOT Ready",
            data:kot

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Mark Served
// ==========================================================

exports.markServed = async(req,res)=>{

    try{

        const kot = await KOT.findById(req.params.id);


        await kot.markServed();


        res.json({

            success:true,
            message:"KOT Served",
            data:kot

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Mark Printed
// ==========================================================

exports.markPrinted = async(req,res)=>{

    try{

        const kot = await KOT.findById(req.params.id);


        await kot.markPrinted();


        res.json({

            success:true,
            message:"KOT Printed",
            data:kot

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// ==========================================================
// Kitchen Queue
// ==========================================================

exports.getKitchenQueue = async(req,res)=>{

    try{

        const data =
        await KOT.getKitchenQueue();


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
// Chef Orders
// ==========================================================

exports.getChefOrders = async(req,res)=>{

    try{


        const data =
        await KOT.getChefOrders(
            req.params.chefId
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
// Pending KOT
// ==========================================================

exports.getPendingKOTs = async(req,res)=>{

    try{


        const data =
        await KOT.getPendingKOTs();


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
// Today KOT
// ==========================================================

exports.getTodayKOTs = async(req,res)=>{

    try{

        const data =
        await KOT.getTodayKOTs();


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
// Search KOT
// ==========================================================

exports.searchKOT = async(req,res)=>{


    try{


        const {keyword}=req.query;


        const data = await KOT.find({

            $or:[

                {
                    kotNo:{
                        $regex:keyword,
                        $options:"i"
                    }
                },

                {
                    remarks:{
                        $regex:keyword,
                        $options:"i"
                    }
                }

            ]

        });


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