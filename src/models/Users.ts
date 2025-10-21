import mongoose, { Schema, Document, Model } from 'mongoose';


interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    profileImage?:string;
    createdAt:Date;
    updatedAt:Date;
}

type UserModelType = Model<IUser>



const userSchema: Schema<IUser>  = new mongoose.Schema({
    name:{
        type:String ,
        required:true,
        unique:true,
        trim:true
    },

    email:{
        type:String ,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },

    password:{
        type:String ,
        required:true,
        minlength:6
    },

    profileImage:{
        type:String 
    }
} , {timestamps:true});

//export default mongoose.model('User', userSchema)
export default mongoose.model<IUser, UserModelType>('User', userSchema);