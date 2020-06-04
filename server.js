const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const cors = require("cors");
const express = require("express");
const app = express();
const JWT = require("jsonwebtoken");
const passport = require("passport");
require("./passport")

app.use(cors());
app.use(bodyParser.json());
app.use(cookieSession(
  {
    name: "gabriel-dev",
    keys: ["key1", "key2"]
  }  
));

const isLoggedIn = (req, res, next) => {
  if(req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
} 

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send("Você precisa se autenticar<br> /google -> para logar conta google<br> /logout -> para sair");
});

app.get('/user', isLoggedIn, (req, res) => {
  //Secret Key gerada com a linha de comando: node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
  JWT.sign({userID: req.user.id, message: `Olá ${req.user.displayName}, email: ${req.user.emails[0].value}`}, 
    '9B7tlR8xDDqO9ZS6LGg7J9wVfv+svhw0D+sjqtPhsEFyLGRmd1eKjUL0HgLH2uwCW+K4ITHORPHvqPnXyTBagdwUbQ2A7tjob+HJGuCl0lllIbMnrJ1jtgPa/s+rf3I7M/8cTfNJtuWfkODyjRgvH/X4VP+AmRKXvQzWPFlqArUgVRiApOB1On1ngAAQ6yjzVZr5afYzqz5sUlhWRNCx+lxtevsDaledXx/9rkSdnjjSEA0Xidb59PLfuoqAYnmkahGHKAw0t8Wq4KymJB+yEmjJ8dfKwn7W0edL+HssD3+u4rXBrMY0TcujcYvHJVMOq9PUtb8lD0acqB68dRInrg==', 
    {algorithm: "HS256"}, 
    function(err, token) {
        if (err) {
            res.status(500);
            console.error(err);
        }
        if (token) {
            const decoded = JWT.decode(token, {complete: true});

            console.log(token);
            res.status(200).send(`Token: ${token}<br> Token Decoded: ${JSON.stringify(decoded)}`);
        }
  });
});

app.get('/fail', function (req, res) {
  res.status(400).send("Você não conseguiu se conectar!");
});

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/fail' }),
  function(req, res) {
    res.redirect('/user');
});

app.get('/logout', (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
})
 
app.listen(3000, () => console.log("Rodando na porta 3000"));