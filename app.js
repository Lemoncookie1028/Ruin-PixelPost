require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: "pixel_secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => res.redirect("/feed"));
app.get("/logout", (req, res) => { req.logout(() => res.redirect("/")); });

app.get("/", (req, res) => res.render("home", { user: req.user }));
app.get("/feed", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.render("feed", { user: req.user, posts: [] });
});

app.listen(3000, () => console.log("Ruin PixelPost running on http://localhost:3000"));
