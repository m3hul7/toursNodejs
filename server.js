const mongoose = require("mongoose")
const dotenv = require("dotenv");

process.on('uncaughtException', (err) => {
  console.log(err.name,  err.message)
  console.log('Uncaught Exception! 💀 Shutting down 💀')
  server.close(() => {
    process.exit()
  })
})

dotenv.config({ path: "./config.env" });

// for mongodb atlas service
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(
  // DB, {
  process.env.DATABASE_LOCAL, {
}).then(con => {
  // console.log(con.connections);
  console.log("database connected")
})

const app = require("./app");

console.log(process.env.NODE_ENV, process.env.PORT);

const port = process.env.port || 5555;
const server = app.listen(port, () => {
  console.log("app started running...");
});

process.on('unhandledRejection', (err) => {
console.log(err.name,  err.message)
console.log('Unhandled Exception! 💀 Shutting down 💀')
  server.close(() => {
    process.exit()
  })
})

// console.log(x)