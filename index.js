const express=require('express');
const cors=require("cors")
const bcrypt=require("bcrypt");
const {JWT_SECRET,auth}=require("./auth");
const jwt=require("jsonwebtoken");
require("./db_schema");
const {TodoModel,UserModel}=require("./db_schema");
const {signUpSchema,signInSchema,todoSchema,newTodoSchema}=require("./z_schema")

const app=express();

app.use(express.json());
app.use(cors({
    exposedHeaders:['Authorization'] 
    //did NOT expose it via CORS, so the browser blocks JS from reading it.
    //for custom headers this msut be done because browser will hide it unless the server explicitly allows access
    // CORS does two things:
    // Who can call the API (origin)
    // What the frontend is allowed to read (headers)
}));

const port=3000;

app.post('/todo/signup',async(req,res)=>{
    const parsed=signUpSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message:"Invalid inputs",
            error:parsed.error.message
        })
    }
    let {username,password,email}=parsed.data
    let user=await UserModel.findOne({
        email
    })
    if(user){
        return res.status(400).json({
            message:"Email aldready exists",
            error:"Try with a new email or SignIn instead"
        })
    }
    let hashedPassword=await bcrypt.hash(password,10)
    let newUser=await UserModel.create({
        username,
        password:hashedPassword,
        email,
    })
    res.status(201).json({
        message:`${username} has succesfully been SigndUp`,
        data:"Please SignIn to access your ToDo-List"
    })
    // .sendFile(__diranme+"signin.html") // --- send file wont work how will u open the page?
})

app.post('/todo/signin',async(req,res)=>{
    const parsed=signInSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({
            message:"Invalid inputs",
            error:parsed.error.message
        })
    }
    let {username,password}=parsed.data
    let user=await UserModel.findOne({
        username
    })
    bcrypt.compare(password,user.password,(err,result)=>{
        if(!result){
            return res.status(400).json({
                message:"Invalid inputs",
                error:"Password incorrect !"
            })
        }
    })
    if(!user){
        return res.status(400).json({
            message:"No such user exists",
            error:"You need to SignUp first"
        })
    }
    //console.log(typeof(user._id));
    let id=user._id;
    const token= jwt.sign(id.toJSON(),JWT_SECRET);
    // why user_.id wasn't working 
    //The jwt.sign() function expects its first argument (the payload) to be a simple, plain JavaScript object, buffer, or string representing valid JSON. 
    //You are likely passing a complex object type, such as a Mongoose Document or a Sequelize model instance, directly to jwt.sign(). These objects 
    // contain extra metadata, methods, and internal properties that are not standard JSON values and cannot be directly serialized into a token. 
    // fix --- toObject() which didnt work her why?
    // or to JSON() functions
    res.setHeader("Authorization",token);
    res.status(200).json({
        message:"You have successfully signed in",
        data:`${__dirname}/list.html`
    })
})

// CRUD of a todo - create, read - see the list, delete - mark as done, update
app.post('/todo/create',auth,async(req,res)=>{
    let parsed=todoSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({
            message:"Invalid Input",
            error:parsed.error.message
        }) 
    }
    const {task}=parsed.data;
    const _id=req._id;
    //this user exists or not has aldready been checked on signup no need to do it again
    //we need to check if this task aldready exists for that user
    let allTasks=await TodoModel.find({
        user:_id
    }).select('task -_id')//id was being sent 
    //console.log(allTasks); // array of objects - [ { task: 'cuddle zara' } ]
    let existingTask=allTasks.find(t => t.task===task)
    if(existingTask){
        return res.status(400).json({
            message:"Task aldready exists in Todo",
            error:"Add a different task or remove duplicate task befroe adding"
        })
    }
    let newTask=await TodoModel.create({
        task:task,
        user:_id
    })
    res.status(200).json({
        message:"New task has been added",
        data:`New task : ${newTask.task}`
    })
})

app.get('/todo/get',auth,async(req,res)=>{
    let _id=req._id;
    let allTasks=await TodoModel.find({
        user:_id
    }).select('task -_id')
    let tasks=allTasks.map(t=>t.task)
    res.status(200).json({
        message:'All tasks fetched successfully',
        data:tasks
    })
})

app.delete('/todo/delete',auth,async(req,res)=>{ //user send task they want to delete
    let _id=req._id;
    let parsed=todoSchema.safeParse(req.body) 
    if(!parsed.success){
        return res.status(400).json({
            message:"Invalid Input",
            error:parsed.error.message
        })
    }
    let {task}=parsed.data
    let deletedTask=await TodoModel.findOneAndDelete({
        task:task,
        user:_id
    })
    if(!deletedTask){
        return res.status(400).json({
            message:"No such task exists",
            error:"Add the task before deleting it"
        })
    }
    res.status(200).json({
        message:"Task has been deleted",
        data:`${deletedTask.task} has been deleted`
    })
})

app.put('/todo/update',auth,async(req,res)=>{
    let _id=req._id;
    let parsed=newTodoSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message:"Invalid input",
            error:parsed.error.message
        })
    }
    const {task,newTask}=parsed.data;
    let originalTodo=await TodoModel.findOne({
        task:task,
        user:_id
    })
    if(!originalTodo){
        return res.status(400).json({
            message:"No suck todo exists",
            error:"Add the todo before udpating it"
        })
    }
    // if u want to return use find and update/delete options
    // if u dont wnat to return use update(filter,updations)
    let newTodo=await TodoModel.findOneAndUpdate({
        task:task,
        user:_id
    },{
        task:newTask
    })
    await newTodo.save()
    // await TodoModel.save() --// save is callen on variable not model
    res.status(200).json({
        message:"Todo has been update",
        data:`New todo is ${newTodo.task}`
    })
})

app.listen(port,()=>{
    console.log(`Server running on ${port}`);
})