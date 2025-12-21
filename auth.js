const jwt=require("jsonwebtoken");
const JWT_SECRET="Jai Mata Di 1234567890";

function auth(req,res,next){
    const token=req.headers.authorization;
    // console.log(token);
    if(!token){
        return res.status(400).json({
            message:"Invalid or Incorrect token",
            error:"No token recieved in request headers"
        })
    }
    try{
        let parsedId=jwt.verify(token,JWT_SECRET);
        req._id=parsedId;
    }catch(e){
        return res.status(400).json({
            message:"Invalid or Incorrect token",
            error:e.message
        })
    }
    next();
}

module.exports={
    JWT_SECRET,
    auth
}