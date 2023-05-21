const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pf543tb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toysCollection = client.db('kiddozDB').collection('toys');
        const blogCollection = client.db('kiddozDB').collection('blogs');

        // const indexKeys = { name: 1, sub_category: 1 };
        // const indexOptions = { name: "nameSubCategory" };
        // const result = await toysCollection.createIndex(indexKeys, indexOptions);

        // Toys Section :

        app.get('/toys', async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result)
        })

        app.get('/toys/:sub_category', async (req, res) => {
            const sub_category = req.params.sub_category;
            if (sub_category === "All Cars") {
                const result = await toysCollection.find().toArray();
                res.send(result)
            }
            else {
                const result = await toysCollection.find({ sub_category: sub_category }).toArray();
                res.send(result)
            }
        })

        app.get('/allToys', async (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            const result = await toysCollection.find().limit(limit).toArray();
            res.send(result)
        })

        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toysCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { sub_category: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        app.get("/toy/:id", async(req, res) => {
            const id = req.params.id;
            const result = await toysCollection.findOne({_id: new ObjectId(id)});
            res.send(result)
        })

        app.get('/myToys', async(req, res) => {
            // console.log(req.query.email)
            let query = {};
            if(req.query?.email){
                query = {seller_email: req.query.email}
            }
            const result = await toysCollection.find(query).toArray();
    
            res.send(result)
        })

        app.get('/myToysSort', async(req, res) => {
            // console.log(req.query.price)
            let query = {};
            if(req.query?.email){
                query = {seller_email: req.query.email}
            }

            const order = req.query?.price === "ascending"? 1 : -1;
            const sort = {price: order}
            // console.log(sort)
            const result = await toysCollection.find(query).sort(sort).toArray();
    
            res.send(result)
        })

        app.post('/toys', async(req, res) =>{
            const toy = req.body;
            // console.log('New Toy', toy);
            const result = await toysCollection.insertOne(toy);
            res.send(result)
        })

        app.put('/toys/:id', async(req, res) =>{
            const id = req.params.id;
            const toy = req.body;
            // console.log(id, toy);
            
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const updatedToy = {
                $set: {
                    name: toy.name,
                    price: toy.price,
                    rating: toy.rating,
                    available_quantity: toy.available_quantity,
                    description: toy.description
                }
            }
    
            const result = await toysCollection.updateOne(filter, updatedToy, options);
            res.send(result)
        })

        app.delete('/toys/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await toysCollection.deleteOne(query)
            res.send(result)
        })

        // Blogs Section : 
        app.get('/blogs', async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Kiddoz Server is running")
});

app.listen(port, () => {
    console.log(`This server is running on port: ${port}`)
})