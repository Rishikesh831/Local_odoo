import express from "express"

const app = express()

const port = 5000; 

app.listen("/",(req,res) => {
    console.log("this is the home page");
    res.send("this is working")
})

app.listen(port, () => {
    console.log("server is running on localhost:5000");
})