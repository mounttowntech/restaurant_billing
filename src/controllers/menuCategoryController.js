const MenuCategory = require("../models/menuCategoryModel");


// ==========================================================
// Create Menu Category
// ==========================================================

exports.createMenuCategory = async (req, res) => {

    try {

        const category = await MenuCategory.create({

            ...req.body,

            createdBy: req.user?.id,

        });


        res.status(201).json({

            success:true,
            message:"Menu category created successfully",
            data:category

        });


    } catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// ==========================================================
// Get All Categories
// ==========================================================

exports.getAllMenuCategories = async(req,res)=>{

    try{


        const categories = await MenuCategory.find()

        .populate(
            "parentCategory",
            "categoryName"
        )

        .sort({
            displayOrder:1,
            createdAt:-1
        });



        res.json({

            success:true,

            count:categories.length,

            data:categories

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Get Category By ID
// ==========================================================

exports.getMenuCategoryById = async(req,res)=>{

    try{


        const category =
        await MenuCategory.findById(req.params.id)

        .populate(
            "parentCategory",
            "categoryName"
        );


        if(!category){

            return res.status(404).json({

                success:false,
                message:"Category not found"

            });

        }



        res.json({

            success:true,
            data:category

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Update Category
// ==========================================================

exports.updateMenuCategory = async(req,res)=>{

    try{


        const category =
        await MenuCategory.findByIdAndUpdate(

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

            message:"Category updated successfully",

            data:category

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Soft Delete Category
// ==========================================================

exports.deleteMenuCategory = async(req,res)=>{

    try{


        const category =
        await MenuCategory.findById(
            req.params.id
        );


        if(!category){

            return res.status(404).json({

                success:false,
                message:"Category not found"

            });

        }



        category.isDeleted = true;

        category.updatedBy = req.user?.id;


        await category.save();



        res.json({

            success:true,

            message:"Category deleted successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Restore Category
// ==========================================================

exports.restoreMenuCategory = async(req,res)=>{

    try{


        const category =
        await MenuCategory.findById(
            req.params.id
        );


        category.isDeleted=false;


        await category.save();



        res.json({

            success:true,

            message:"Category restored successfully",

            data:category

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};





// ==========================================================
// Toggle Availability
// ==========================================================

exports.toggleAvailability = async(req,res)=>{

    try{


        const category =
        await MenuCategory.findById(
            req.params.id
        );


        category.isAvailable =
        !category.isAvailable;



        await category.save();



        res.json({

            success:true,

            message:"Availability updated",

            isAvailable:
            category.isAvailable

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Toggle Active Status
// ==========================================================

exports.toggleActiveStatus = async(req,res)=>{

    try{


        const category =
        await MenuCategory.findById(
            req.params.id
        );


        category.isActive =
        !category.isActive;


        await category.save();



        res.json({

            success:true,

            message:"Active status updated",

            isActive:
            category.isActive

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Popular Categories
// ==========================================================

exports.getPopularCategories = async(req,res)=>{

    try{


        const categories =
        await MenuCategory.find({

            isPopular:true,
            isDeleted:false

        });


        res.json({

            success:true,
            data:categories

        });


    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Store Wise Categories
// ==========================================================

exports.getStoreCategories = async(req,res)=>{

    try{


        const categories =
        await MenuCategory.find({

            store:req.params.storeId,

            isDeleted:false

        });



        res.json({

            success:true,
            data:categories

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Kitchen Section Wise
// ==========================================================

exports.getKitchenSectionCategories =
async(req,res)=>{

    try{


        const categories =
        await MenuCategory.find({

            kitchenSection:
            req.params.section,

            isDeleted:false

        });



        res.json({

            success:true,
            data:categories

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Parent Categories
// ==========================================================

exports.getParentCategories =
async(req,res)=>{

    try{


        const categories =
        await MenuCategory.find({

            parentCategory:null,

            isDeleted:false

        });



        res.json({

            success:true,
            data:categories

        });


    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// ==========================================================
// Search Category
// ==========================================================

exports.searchMenuCategory =
async(req,res)=>{


    try{


        const {keyword}=req.query;



        const categories =
        await MenuCategory.find({

            $or:[

                {
                    categoryName:{
                        $regex:keyword,
                        $options:"i"
                    }
                },

                {
                    categoryCode:{
                        $regex:keyword,
                        $options:"i"
                    }
                }

            ],

            isDeleted:false

        });



        res.json({

            success:true,

            data:categories

        });



    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};