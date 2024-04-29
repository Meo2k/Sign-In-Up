const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path'); // Import thư viện path
require('dotenv').config();

const users = require('./users.json');
const res = require('express/lib/response');
const { ok } = require('assert');
const session = require('express-session');
const { nextTick } = require('process');


app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true } // Thiết lập secure tùy theo môi trường (production hay development)
}));


app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ các tệp tĩnh từ thư mục public

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views')); 

// Route cho trang chính
function isAuthenticated(req,res, next){
  if(req.session && req.session.isAuthenticated){
    next();
  }else{
    res.redirect('/'); 
  }
}

function removeIsAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    delete req.session.isAuthenticated;
  }
  next();
}

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/signUp',(req,res) =>{
  res.render('signUp')
} )
app.post('/signUp/accounts', (req, res) => {
  let { name, password } = req.body;
  users.push({ name, password });

  const fs = require('fs');
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));

  res.status(200).json(users);
});

app.post('/users', (req, res) => {
  const { userName, passWord } = req.body;
  const user = users.find(user => user.name === userName);
  if (user && user.password === passWord) { 
    req.session.isAuthenticated = true
    
    res.status(200).json({ message: "Login successfully" });
   
    console.log("session: ", req.session); 
  } else {
    res.status(404).json({ message: "Username or Password is incorrect" });
    
  }
  
});

app.get('/signUp', (req,res) =>{
  res.render('signup'); 
})

app.get('/todos', isAuthenticated,removeIsAuthenticated,  (req,res)=>{
  res.render('firework')
  
})

let port = process.env.PORT ;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
