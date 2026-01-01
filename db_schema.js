const mongoose=require('mongoose')
const Schema=mongoose.Schema
mongoose.connect("")
.then(()=>{console.log("Mongo Connected !")})
.catch(e =>console.log(`There was an error : \n ${e}`))


const Users=new Schema({
    username:{
        type : String,
        required : true,
        unique : true,
        minlength : 1
    },
    password:{
        type : String,
        required : true,
        minlength : 8
    },
    email:{
        type : String,
        required : true,
        unique : true,
        minlength : 5
    }
})

const Todo=new Schema({
    task:{
        type: String,
        minlength:1,
        required:true,
        // unique:true --- if u do this two users cant have the same tasks in db
        //  this check will come later
    },
    user:{
        type:mongoose.Types.ObjectId,
        required:true,
        $ref:"User"
    }
})

TodoModel=mongoose.model("Todo",Todo)
UserModel=mongoose.model("User",Users)

module.exports={
    TodoModel,
    UserModel
}