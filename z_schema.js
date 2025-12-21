const z=require('zod');

const signUpSchema=z.object({
    username:z.string().min(1),
    password:z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/),
    email:z.email()
})

const signInSchema=z.object({
    username:z.string().min(1),
    password:z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/)
})

const todoSchema=z.object({
    task:z.string().min(1)
})

const newTodoSchema=z.object({
    task:z.string().min(1),
    newTask:z.string().min(1)
})

module.exports={
    signUpSchema,
    signInSchema,
    todoSchema,
    newTodoSchema
}