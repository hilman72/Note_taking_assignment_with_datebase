require("dotenv").config();
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const path = require("path");
const session = require("express-session");
const setupPassport = require("./passport");

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({ defaultLayout: "index" }));
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);
setupPassport(app);

app.use("/files", require("./routers/files"));
app.get("/", function (req, res) {
  res.render("login");
});

app.listen(8000, function () {
  console.log("fixx you");
});
