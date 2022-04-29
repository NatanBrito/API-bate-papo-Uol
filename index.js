import express from "express";
import cors from "cors";
import chalk from "chalk";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";
import dotenv from "dotenv";
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
    const user={name: 'xxx', lastStatus: Date.now()} 
    try{
        await mongoClient.connect();
        const dataBaseUsers=mongoClient.db("users")
        await dataBaseUsers.collection("users").insertOne(user)  
        res.sendStatus(200)

        mongoClient.close();
    }catch(e){
        console.log("deu erro patrão")
        res.sendStatus(500)
        mongoClient.close();
    }
})
app.get("/participants", async (req,res)=>{
    try{
        await mongoClient.connect();
        const dataBase=mongoClient.db("users");
        const returnUsers= await dataBase.collection("users").find({}).toArray();
        res.send(returnUsers);
        mongoClient.close();
    }catch(e){
        res.status(501).send("fez merda burrão")
        mongoClient.close();
    }
})
app.post("/messages",async (req,res)=>{
    const from = req.headers.user; //ver se tem na lista de participantes
    const {to,text,type} =req.body; //validar todas as informações
    const message={from,to,text,type,time:dayjs().format('HH:MM:ss')};
    try{
        await mongoClient.connect();
        const messages=mongoClient.db("messages")
        await messages.collection("messages").insertOne(message)
        res.send(xx)
        mongoClient.close();
    } catch(e){
        res.sendStatus(500)
        mongoClient.close();
    }
})
app.get("/messages",async (req,res)=>{
    const user=req.headers.user;
    let limit=(req.query.limit) // ver se ta certo e meter o parseInt no number
    try{
        await mongoClient.connect();
        const db=mongoClient.db("messages")
        const messages= await db.collection("messages").find({}).toArray();
        const userMessages=[];
        for(let i=0;i<messages.length;i++){
           if(messages[i].to === user || messages[i].type !== "private_message"){
               userMessages.push(messages[i])
            }
        }
        if(limit === undefined){
            limit= messages.length;
        }
        res.send(userMessages.splice(0,parseInt(limit)))
        mongoClient.close();
    }catch(e){
        res.status(404).send("ta vacilando em moscão")
        mongoClient.close();
    }
})