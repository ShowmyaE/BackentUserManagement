const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')
const cors = require("cors");
const { v4: uuidv4 } = require('uuid'); 
const jwt = require('jsonwebtoken')


app.use(cors());
app.use(express.json())

const dbPath = path.join(__dirname, 'demodb.db')
let db = null

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(5007, () => {
            console.log('Server Running at http://localhost:5007')
        })
    } catch (error) {
        console.log(`DB Error : ${error.message}`)
        process.exit(1)
    }
}
initializeDbAndServer()

app.get('/',async(req,res)=>{
    //  const createTable=`CREATE TABLE  registration(
    //   customerid VARCHAR,
    //   firstName TEXT NOT NULL,
    //   lastName TEXT NOT NULL,
    //   email TEXT NOT NULL,
    //   password TEXT NOT NULL
            
    //   );`
    //  const createData=await db.run(createTable);
    const getUserQuery=`select * from registration`;
    const userDbDetails=await db.all(getUserQuery);
    console.log('DB value',userDbDetails);
    res.send(userDbDetails)

})
const authentication = (request, response, next) => {
    let jwtToken
    console.log("AUTH", request.headers['authorization'])
    const authHeader = request.headers['authorization']
    if (authHeader) {
      jwtToken = authHeader.split(' ')[1]
    }
    console.log("JWT", jwtToken)

    if (jwtToken) {
      jwt.verify(jwtToken, 'SECRET_KEY', (error, payload) => {
        if (error) {
          response.status(401)
          response.send('Invalid JWT Token')
        } else {
          request.email = payload.email
          request.userId = payload.userId
          next()
        }
      })
    } else {
      response.status(401)
      response.send('Invalid JWT Token')
    }
  }
  
app.post("/signUp",async(req,res)=>{
    const {firstName,lastName,email, password} = req.body
    console.log('DB value',firstName,lastName,email,password)
    const id = uuidv4();

     const insertquery=`INSERT INTO registration(customerid, firstName,lastName,email, password)
    VALUES ('${id}','${firstName}','${lastName}', '${email}','${password}')`;
    const insertData=await db.run(insertquery)
if(insertData) {
    res.send({data:"successfully inserted"})
}
else{
    res.status(400)
    res.send({data:"Failed to inserted"})
}
})

app.post("/loginIn",async(req,res)=>{
    const {email, password} = req.body
    console.log('DB value',email,password)
    const getUserQuery = `SELECT * FROM registration WHERE email='${email}' AND password='${password}';`
    const userDbDetails = await db.get(getUserQuery)
    console.log(userDbDetails)
    if (userDbDetails) {
        const payload = {email:email,userId:userDbDetails.CustomerId}
        const jwtToken = jwt.sign(payload, 'SECRET_KEY')
        res.send({jwtToken})
      } else {
        res.status(400)
        res.send('Invalid password')
      }
    //  res.send({data:"user is valid "})

})

app.get('/users', authentication,async (req, res) => {
    // const createTable=`CREATE TABLE  users(
    //   id INTEGER PRIMARY KEY AUTOINCREMENT,
    //   first_name TEXT NOT NULL,
    //   last_name TEXT NOT NULL,
    //   email TEXT NOT NULL,
    //   department TEXT NOT NULL
            
    //   );`
    //  const createData=await db.run(createTable);
    // const insertquery=`INSERT INTO users(first_name,last_name,email,department)
    // VALUES ('Chithra','Ragu','chithra09@gmail.com','IT')`;
    // const insertData=await db.run(insertquery)
      
        const query = `SELECT * FROM users `
        const userDbDetails =  await db.all(query);
            console.log('DB value', userDbDetails);
            res.send(userDbDetails)

})

app.post('/users',async(req,res)=>{
    const { first_name, last_name, email, department } = req.body;
    const insertquery=`INSERT INTO users (first_name,last_name,email,department)
    VALUES ('${first_name}','${last_name}','${email}','${department}')`;
   const insertData=await db.run(insertquery)
   
   const query = `SELECT * FROM users `
   const userDbDetails =  await db.all(query);
       console.log('DB value', userDbDetails);
       res.send(userDbDetails)
})

app.put('/users/:id',async (req, res) => {
    const userId = parseInt(req.params.id); 
    const { email, department} = req.body;
    const updatequery=`UPDATE users SET email='${email}', department='${department}' WHERE id='${userId}'`;
   const updateData=await db.run(updatequery)
   
   const query = `SELECT * FROM users `
   const userDbDetails =  await db.all(query);
       console.log('DB value', userDbDetails);
       res.send(userDbDetails)
})

app.delete('/users/:id', async(req, res) => {
    const userId = req.params.id;
  
    const deletequery = `DELETE FROM users WHERE id = '${userId}'`;
    const deleteData=await db.run(deletequery)
   
    const query = `SELECT * FROM users `
    const userDbDetails =  await db.all(query);
        console.log('DB value', userDbDetails);
        res.send(userDbDetails)
 })