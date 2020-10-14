const express = require("express");
const router = express.Router();
const fs = require("fs");

const db = require("knex")({
  // CODE HERE
  client: "pg",
  connection: {
    database: "weekly",
    user: "hilman",
    password: "92399831",
  },
});

//get
router.get("/body", function (req, res) {
  db.select("*")
    .from("note")
    .then((data) => {
      let note = data;

      res.render("body", {
        note,
      });
    });
});

router.get("/edit/:id", function (req, res) {
  const realId = req.params.id;
  db.select("*")
    .from("note")
    .then((data) => {
      let EditItem = data.filter((EditItem) => {
        return EditItem.id == realId;
      })[0];

      const index = data.indexOf(EditItem);

      let detail = data[index];

      res.render("edit", {
        detail,
      });
    });
});

//post
router.post("/post", (req, res) => {
  const { title, message } = req.body;
  db("note")
    .insert({
      title: title,
      message: message,
    })
    .then(res.redirect("back"));
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.select("*")
    .from("users")
    .then((data) => {
      let loginPP = data.filter((ppName) => {
        return ppName.name == username;
      });

      if (loginPP.length == 0) {
        res.redirect("/");
      } else if (
        loginPP[0].name == username &&
        loginPP[0].password == password
      ) {
        res.redirect("/files/body");
      } else {
        res.redirect("/");
      }
    });
});

//put
router.post("/put/:id", async (req, res) => {
  const realId = await req.params.id;
  const { title, message } = req.body;
  db("note")
    .where("id", "=", realId)
    .update({
      title: title,
      message: message,
    })
    .then(res.redirect("/files/body"));
});

//delete
router.post("/delete/:id", async (req, res) => {
  const realId = await req.params.id;
  db("note").where("id", "=", realId).del().then(res.redirect("/files/body"));
});

module.exports = router;

// INSERT INTO note (title, message) VALUES('second', 'try try try');
