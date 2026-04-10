import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        await mongoose.connect(`${process.env.DB_STRING}/${process.env.DB_NAME}`)
        console.log("DB CONNECTED!");
        
    } catch (error) {
        console.log("DB CONNECTION ERROR: ", error);
        throw error
    }
}

export default dbConnection