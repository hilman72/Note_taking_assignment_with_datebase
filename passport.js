const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("./bcrypt");

const db = require("knex")({
  // CODE HERE
  client: "pg",
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
  },
});

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    "local-login",
    new LocalStrategy(async (username, password, done) => {
      try {
        let users = await db("users").where({ name: username });
        if (users.length == 0) {
          return done(null, false, { message: "Incorrect credentials." });
        }
        let user = users[0];
        let result = await bcrypt.checkPassword(password, user.password);
        if (result) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect credentials." });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    let users = await db("users").where({ id: id });
    if (users.length == 0) {
      return done(new Error(`Wrong user id ${id}`));
    }
    let user = users[0];
    return done(null, user);
  });

  passport.use(
    "local-signup",
    new LocalStrategy(async (username, password, done) => {
      try {
        let users = await db("users").where({ name: username });
        if (users.length > 0) {
          return done(null, false, { message: "username already taken" });
        }
        let hash = await bcrypt.hashPassword(password);
        const newUser = {
          name: username,
          password: hash,
        };
        let userId = await db("users").insert(newUser).returning("id");
        newUser.id = userId[0];
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    })
  );
};
