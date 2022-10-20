const mongoose = require("mongoose")
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(
  // DB, {
  process.env.DATABASE_LOCAL, {
}).then(con => {
  // console.log(con.connections);
  console.log("db connected !!!!!")
})

const app = require("./app");

// console.log(process.env);

const port = process.env.port || 5555;
app.listen(port, () => {
  console.log("app started running...");
});
