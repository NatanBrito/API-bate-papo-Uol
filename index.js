import express from "express";
import cors from "cors";
import chalk from "chalk";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
// ...
//npm run dev (pra derrubar/levantar o server de nov)
const app=express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.listen(5000,()=>{console.log(chalk.bold.green("Silencio, estamos no AR!!!"))})

app.post("/participants",(req,res)=>{
    const {name} =req.body;
 res.send("sem, validações")
})
app.post("/messages",(req,res)=>{
    const from = req.headers.user; //ver se tem na lista de participantes
    const {to,text,type} =req.body; //validar todas as informações
 res.send("sem, validações")
})
app.get("/messages",(req,res)=>{
    const {limit}=req.params // ver se ta certo e meter o parseInt no number
})