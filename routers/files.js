const express = require("express");
const router = express.Router();

const passport = require("passport");

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
router.get("/body/:name", function (req, res) {
  const uName = req.params.name;
  db.select("*")
    .from("note")
    .then((data) => {
      let note = data;
      let c_user = uName;

      res.render("body", {
        note,
        c_user,
        public: true,
      });
    });
});

router.get("/body/private/:name", function (req, res) {
  const uName = req.params.name;
  db.select("*")
    .from("p_note")
    .then((data) => {
      let uNote = data.filter((note) => {
        return note.editor == uName;
      });

      let note = uNote;
      let c_user = uName;

      res.render("body", {
        note,
        c_user,
        private: true,
      });
    });
});

router.get("/edit/:name/:id", function (req, res) {
  const realId = req.params.id;
  const uName = req.params.name;
  db.select("*")
    .from("note")
    .then((data) => {
      let EditItem = data.filter((EditItem) => {
        return EditItem.id == realId;
      })[0];

      const index = data.indexOf(EditItem);

      let detail = data[index];
      let c_user = uName;

      res.render("edit", {
        detail,
        c_user,
        public: true,
      });
    });
});

router.get("/edit/private/:name/:id", function (req, res) {
  const realId = req.params.id;
  const uName = req.params.name;
  db.select("*")
    .from("p_note")
    .then((data) => {
      let EditItem = data.filter((EditItem) => {
        return EditItem.id == realId;
      })[0];

      const index = data.indexOf(EditItem);

      let detail = data[index];
      let c_user = uName;

      res.render("edit", {
        detail,
        c_user,
        private: true,
      });
    });
});

router.get("/signIn", function (req, res) {
  res.render("signin");
});

//post
router.post("/post/:name", (req, res) => {
  const uName = req.params.name;
  const { title, message, pb } = req.body;

  if (pb == "public") {
    db("note")
      .insert({
        title: title,
        message: message,
        editor: uName,
      })
      .then(res.redirect("back"));
  } else if (pb == "private") {
    db("p_note")
      .insert({
        title: title,
        message: message,
        editor: uName,
      })
      .then(res.redirect(`/files/body/private/${uName}`));
  }
});

//check pw
router.post(
  "/login",
  passport.authenticate("local-login", { failureRedirect: "/" }),
  function (req, res) {
    const { username, password } = req.body;
    res.redirect(`/files/body/${username}`);
  }
);

// logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//sign up

router.post(
  "/signup",
  passport.authenticate("local-signup", { failureRedirect: "/" }),
  function (req, res) {
    const { username, password } = req.body;
    res.redirect(`/files/body/${username}`);
  }
);

//put
router.post("/put/:name/:id", async (req, res) => {
  const realId = await req.params.id;
  const uName = req.params.name;
  const { title, message, pb } = req.body;
  if (pb == "public") {
    db("note")
      .where("id", "=", realId)
      .update({
        title: title,
        message: message,
      })
      .then(res.redirect(`/files/body/${uName}`));
  } else if (pb == "private") {
    db("p_note")
      .insert({
        title: title,
        message: message,
        editor: uName,
      })
      .then(
        db("note")
          .where("id", "=", realId)
          .del()
          .then(res.redirect(`/files/body/private/${uName}`))
      );
  }
});

router.post("/put/private/:name/:id", async (req, res) => {
  const realId = await req.params.id;
  const uName = req.params.name;
  const { title, message, pb } = req.body;
  if (pb == "private") {
    db("p_note")
      .where("id", "=", realId)
      .update({
        title: title,
        message: message,
      })
      .then(res.redirect(`/files/body/private/${uName}`));
  } else if (pb == "public") {
    db("note")
      .insert({
        title: title,
        message: message,
        editor: uName,
      })
      .then(
        db("p_note")
          .where("id", "=", realId)
          .del()
          .then(res.redirect(`/files/body/${uName}`))
      );
  }
});

//delete
router.post("/delete/:name/:id", async (req, res) => {
  const realId = await req.params.id;
  const uName = req.params.name;
  db("note")
    .where("id", "=", realId)
    .del()
    .then(res.redirect(`/files/body/${uName}`));
});

router.post("/delete/private/:name/:id", async (req, res) => {
  const realId = await req.params.id;
  const uName = req.params.name;
  db("p_note")
    .where("id", "=", realId)
    .del()
    .then(res.redirect(`/files/body/private/${uName}`));
});

module.exports = router;

// INSERT INTO users (name, password) VALUES('sam', 'sam');
