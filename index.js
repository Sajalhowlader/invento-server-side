const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;

// user inventoWarehouse
// pass 9VlOgcVhJUbmz83p
// Middleware
app.use(cors())
app.use(express.json())

// Root API
app.get('/', (req, res) => {
    res.send('Cash and carry site is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aay4n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const productsCollection = client.db('inventoWarehouse').collection('products')

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })
        // update product with id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product)
        })


    } finally {

    }
}
run().catch(console.dir)
//Port
app.listen(port, () => {
    console.log("cash and carry is running on port", port)
})
