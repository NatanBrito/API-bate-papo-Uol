import express from "express";
import cors from "cors";
import chalk from "chalk";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
// ...
//npm run dev (pra derrubar/levantar o server de nov)
const app=express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.listen(5000,()=>{console.log(chalk.bold.green("Silencio, estamos no AR!!!"))})
let db=null;
const mongoClient= new MongoClient("mongodb://localhost:27017");// .env nao funfando
app.post("/participants", async (req,res)=>{
    const {name} =req.body;//dayjs().format('HH:MM:ss')
    const user={name: 'xxx', lastStatus: Date.now()} 
    try{
        await mongoClient.connect();
        const dataBaseUsers=mongoClient.db("users")
        const UsersData=await dataBaseUsers.collection("users").insertOne(user)  
        res.sendStatus(200)
        mongoClient.close();
    }catch(e){
        console.log("deu erro patrão")
        res.sendStatus(500)
        mongoClient.close();
    }
})
app.post("/messages",(req,res)=>{
    const from = req.headers.user; //ver se tem na lista de participantes
    const {to,text,type} =req.body; //validar todas as informações
 res.send("sem, validações")
})
app.get("/messages",(req,res)=>{
    const {limit}=req.params // ver se ta certo e meter o parseInt no number
})