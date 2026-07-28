const MenuItem = require("../models/MenuItem");


// ==========================================================
// Create Menu Item
// ==========================================================

exports.createMenuItem = async (req, res) => {

    try {

        const menuItem = await MenuItem.create({
            ...req.body,
            createdBy: req.user?.id
        });


        res.status(201).json({
            success:true,
            message:"Menu item created successfully",
            data:menuItem
        });


    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Get All Menu Items
// ==========================================================

exports.getMenuItems = async(req,res)=>{

    try{


        const {
            restaurant,
            store,
            category,
            status,
            foodType
        } = req.query;


        let filter={};


        if(restaurant)
            filter.restaurant=restaurant;


        if(store)
            filter.store=store;


        if(category)
            filter.menuCategory=category;


        if(status)
            filter.status=status;


        if(foodType)
            filter.foodType=foodType;



        const items = await MenuItem
        .find(filter)
        .populate("menuCategory","categoryName")
        .populate("recipe")
        .populate("kitchen","kitchenName")
        .sort({
            displayOrder:1,
            createdAt:-1
        });



        res.json({

            success:true,
            count:items.length,
            data:items

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Get Menu Item By ID
// ==========================================================

exports.getMenuItemById = async(req,res)=>{

    try{


        const item = await MenuItem
        .findById(req.params.id)
        .populate("menuCategory")
        .populate("recipe")
        .populate("kitchen");


        if(!item){

            return res.status(404).json({
                success:false,
                message:"Menu item not found"
            });

        }



        res.json({

            success:true,
            data:item

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Update Menu Item
// ==========================================================

exports.updateMenuItem = async(req,res)=>{

    try{


        const item = await MenuItem.findByIdAndUpdate(

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


        if(!item){

            return res.status(404).json({
                success:false,
                message:"Menu item not found"
            });

        }



        res.json({

            success:true,
            message:"Menu item updated successfully",
            data:item

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Soft Delete Menu Item
// ==========================================================

exports.deleteMenuItem = async(req,res)=>{

    try{


        const item = await MenuItem.findByIdAndUpdate(

            req.params.id,

            {
                isDeleted:true,
                updatedBy:req.user?.id
            },

            {
                new:true
            }

        );



        if(!item){

            return res.status(404).json({
                success:false,
                message:"Menu item not found"
            });

        }



        res.json({

            success:true,
            message:"Menu item deleted successfully"

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Restore Menu Item
// ==========================================================

exports.restoreMenuItem = async(req,res)=>{

    try{


        const item = await MenuItem.findByIdAndUpdate(

            req.params.id,

            {
                isDeleted:false,
                updatedBy:req.user?.id
            },

            {
                new:true
            }

        );


        res.json({

            success:true,
            message:"Menu item restored successfully",
            data:item

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Search Menu Items
// ==========================================================

exports.searchMenuItems = async(req,res)=>{

    try{


        const keyword=req.query.keyword;


        const items = await MenuItem.find({

            $or:[

                {
                    menuName:{
                        $regex:keyword,
                        $options:"i"
                    }
                },

                {
                    menuCode:{
                        $regex:keyword,
                        $options:"i"
                    }
                }

            ]

        });



        res.json({

            success:true,
            count:items.length,
            data:items

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Category Wise Menu
// ==========================================================

exports.getCategoryWiseMenu = async(req,res)=>{

    try{


        const items = await MenuItem.find({

            menuCategory:req.params.categoryId

        })
        .populate(
            "menuCategory",
            "categoryName"
        );



        res.json({

            success:true,
            data:items

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Available Menu Items
// ==========================================================

exports.getAvailableMenuItems = async(req,res)=>{

    try{


        const items = await MenuItem.find({

            isAvailable:true,
            status:"Active"

        });


        res.json({

            success:true,
            data:items

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Update Availability
// ==========================================================

exports.updateAvailability = async(req,res)=>{

    try{


        const item = await MenuItem.findByIdAndUpdate(

            req.params.id,

            {
                isAvailable:req.body.isAvailable
            },

            {
                new:true
            }

        );


        res.json({

            success:true,
            message:"Availability updated",
            data:item

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================================================
// Update Status
// ==========================================================

exports.updateStatus = async(req,res)=>{

    try{


        const item = await MenuItem.findByIdAndUpdate(

            req.params.id,

            {
                status:req.body.status
            },

            {
                new:true
            }

        );


        res.json({

            success:true,
            message:"Status updated",
            data:item

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};