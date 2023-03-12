import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    refresh_tokens:{
        type: [String]
    }
})

export = mongoose.model('User',userSchema)

