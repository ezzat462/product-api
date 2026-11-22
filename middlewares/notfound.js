const notfound=(req,res,next)=>{
    res.status(404).json({
        status:'fail',
        message:`Route ${req.originalUrl} not found`
    });
}
module.exports=notfound;