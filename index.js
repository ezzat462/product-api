const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
const fs=require('fs');
const router=require('./routes/productRoutes');
const notfound=require('./middlewares/notfound');
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use('/api/products',router);
app.use(notfound);
require('dotenv').config();
const connectServer=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL,{
            dbName:'store'
        });
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT,()=>{
            console.log('Server is running ');
        }
    );
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};
connectServer();