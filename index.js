import express from "express";
import cors from "cors";
import chalk from "chalk";
import { MongoClient, ObjectId } from "mongodb";
import dayjs from "dayjs";
import dotenv from "dotenv";
import joi from "joi";
const postschema = joi.object({});
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.listen(5000, () => {
  console.log(chalk.bold.green("Silencio, estamos no AR!!!"));
});
const mongoClient = new MongoClient("mongodb://localhost:27017"); // .env nao funfando
app.post("/participants", async (req, res) => {
  const { name } = req.body;

  let user = { name, lastStatus: Date.now() };
  const userSchema = joi.object({
    name: joi.string().required(),
    lastStatus: joi.number(),
  });
  const validate = userSchema.validate(user);
  if (validate.error) {
    res.status(422).send(validate.error);
    return;
  }
  try {
    await mongoClient.connect();
    const dataBaseUsers = mongoClient.db("projeto-Uol");
    const search = await dataBaseUsers.collection("users").findOne({ name });
    if (search) {
      res.status(409).send("repetido");
      return;
    }
    await dataBaseUsers.collection("users").insertOne(user);
    await dataBaseUsers.collection("messages").insertOne({ // adicionei essa mensagem as 19:45, esqueci
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:MM:ss"),
    });
    res.sendStatus(201);

    mongoClient.close();
  } catch (e) {
    res.sendStatus(422);
    mongoClient.close();
  }
});
app.get("/participants", async (req, res) => {
  try {
    await mongoClient.connect();
    const dataBase = mongoClient.db("projeto-Uol");
    const returnUsers = await dataBase.collection("users").find({}).toArray();
    res.send(returnUsers);
    mongoClient.close();
  } catch (e) {
    res.status(501).send("fez merda burrão");
    mongoClient.close();
  }
});
app.post("/messages", async (req, res) => {
  const messageSchema = joi.object({
    from: joi.string().min(1).required(),
    to: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    type: joi.any().valid("message", "private_message").required(),
    time: joi.string().required(),
  });
  const from = req.headers.user;
  const { to, text, type } = req.body;
  const message = { from, to, text, type, time: dayjs().format("HH:MM:ss") };
  const validate = messageSchema.validate(message);
  if (validate.error) {
    res.status(409).send(validate.error.details);
    return;
  }
  try {
    await mongoClient.connect();
    const messages = mongoClient.db("projeto-Uol");
    const onParticipant = await messages
      .collection("users")
      .find({ name: from })
      .toArray();
    if (onParticipant.length === 0) {
      res.sendStatus(422);
      mongoClient.close();
      return;
    }
    await messages.collection("messages").insertOne(message);

    res.sendStatus(201);
    mongoClient.close();
  } catch (e) {
    res.sendStatus(500);
    mongoClient.close();
  }
});
app.get("/messages", async (req, res) => {
  const user = req.headers.user;
  let limit = req.query.limit;
  try {
    await mongoClient.connect();
    const db = mongoClient.db("projeto-Uol");
    const messages = await db.collection("messages").find({}).toArray();
    const userMessages = [];
    for (let i = 0; i < messages.length; i++) {
      if (
        messages[i].to === user ||
        messages[i].type !== "private_message" ||
        messages[i].type === "status" ||
        messages[i].from === user
      ) {
        userMessages.push(messages[i]);
      }
    }
    if (!limit) {
      limit = messages.length;
    }
    res.send(userMessages.splice(0, parseInt(limit)));
    mongoClient.close();
  } catch (e) {
    res.status(404).send("ta vacilando em moscão");
    mongoClient.close();
  }
});
app.post("/status", async (req, res) => {
  const user = req.headers.user;
  try {
    await mongoClient.connect();
    const list = mongoClient.db("projeto-Uol");
    const findUser = await list.collection("users").findOne({ name: user });
    if (!findUser) {
      res.sendStatus(404);
      return;
    }
    const updateTime = await list
      .collection("users")
      .updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
    res.send(200);
    mongoClient.close();
  } catch (e) {
    res.sendStatus(409);
    mongoClient.close();
  }
});
setInterval(async () => {
  try {
    await mongoClient.connect();
    const list = mongoClient.db("projeto-Uol");
    const usuario = await list.collection("users").find({}).toArray();
    mongoClient.close();
    usuario.forEach(async (user) => {
      let now = Date.now();
      let time = now - user.lastStatus;
      if (time > 15000) {
        try {
          await mongoClient.connect();
          const db = mongoClient.db("projeto-Uol");
          await db.collection("users").deleteOne({ _id: user._id });
          await db
            .collection("messages")
            .insertOne({
              from: user.name,
              to: "Todos",
              text: "sai da sala...",
              type: "status",
              time: dayjs().format("HH:MM:ss"),
            });

          mongoClient.close();
        } catch (e) {
          mongoClient.close();
        }
      }
    });
  } catch (e) {
    res.send("foi de base burrão");
    mongoClient.close();
  }
}, 15000);
