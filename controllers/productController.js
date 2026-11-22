const Product=require('../models/productModel');
const jsendStatus=require('../utils/jsendStatus');
const{sendsuccess,sendfail,senderror}=require('../utils/sendResponse');

const getAllProducts=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||10;
        const skip=(page-1)*limit;
        const products=await Product.find()
        .skip(skip)
        .limit(limit);
        sendsuccess(res,products);
    }catch(err){
        senderror(res,err.message);
    }
}
const getProductById=async(req,res)=>{
    try{
        const product=await Product.findById(req.params.id);
        if(!product){
            return sendfail(res,{message:'Product not found'},404);
        }
        sendsuccess(res,product);
    }catch(err){
        senderror(res,err.message);
    }
}
const createProduct=async(req,res)=>{
    try{
        console.log(req.body);
        const product=await Product.create(req.body);
        sendsuccess(res,product,201);
    }catch(err){
        senderror(res,err.message);
    }
}

const updateProduct=async(req,res)=>{
    try{
        const product=await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
            new:true,
            runValidators:true  
        });
        if(!product){
            return sendfail(res,{message:'Product not found'},404)
        }
        else{
        sendsuccess(res,product);
        }
    }catch(err){
        senderror(res,err.message);
    }
    
}
const deleteProduct=async(req,res)=>{
    try{
        const product=await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return sendfail(res,{message:'Product not found'},404)
        }
       sendsuccess(res,{message:'Product deleted successfully'});
    }catch(err){
        senderror(res,err.message);
    }
    
}
module.exports={getAllProducts,getProductById,createProduct,updateProduct,deleteProduct};