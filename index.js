const express = require('express');
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())

// Root API
app.get('/', (req, res) => {
    res.send('Cash and carry site is running')
})

//Port
app.listen(port, () => {
    console.log("cash and carry is running on port", port)
})
