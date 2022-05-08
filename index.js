const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
var jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())

function tokenVerify(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorize Access" })
    }
    const userToken = authHeader.split(' ')[1]
    jwt.verify(userToken, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" })
        }
        req.decoded = decoded
        next();
    })

}


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
        const itemsCollection = client.db('inventoWarehouse').collection('orders')

        // jwt token
        app.post('/singIn', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ token })
        })



        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })
        // add new items
        app.post('/products', async (req, res) => {
            const updateProduct = req.body
            const result = await productsCollection.insertOne(updateProduct);
            res.send(result);
        })
        // update product with id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product)
        })

        // update stock
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: updatedUser
            };
            const result = await productsCollection.updateOne(filter, updatedDoc);
            res.send(result);

        })

        // delete items
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })
        // my items
        app.post('/myItems', async (req, res) => {
            const myItems = req.body
            const result = await itemsCollection.insertOne(myItems)
            res.send(result)
        })
        // show my order
        app.get('/myItems', tokenVerify, async (req, res) => {
            const decoEmail = req.decoded.email
            const email = req.query.email;
            if (email === decoEmail) {
                const cursor = itemsCollection.find({ email: email })
                const orders = await cursor.toArray()
                res.send(orders)
            } else {
                res.status(403).send({ message: "Forbidden Access" })
            }
        })

    } finally {

    }
}
run().catch(console.dir)
//Port
app.listen(port, () => {
    console.log("cash and carry is running on port", port)
})
