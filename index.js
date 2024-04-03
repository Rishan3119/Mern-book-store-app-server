const express = require('express')
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// middlewear 
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!')
})

// mongodb confiq here
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://mern-book-store:mern123@cluster0.kabzyf5.mongodb.net/?retryWrites=true&w=majority";

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
        await client.connect();
        // create collection
        const bookCollections = client.db("BookInventory").collection("Books");
        const CartCollections = client.db("BookInventory").collection("cartItems");
        // insert a book to db: Post Method
        app.post("/upload-book", async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await bookCollections.insertOne(data);
            res.send(result);
        })
        //all carts
        //pposting carts to db
        app.post("/carts",async(req,res)=>{
            const cartItem = req.body;
            const result = await CartCollections.insertOne(cartItem);
            res.send(result);
        })
        //get carts using email
        app.get("/carts", async (req,res)=>{
            const email = req.query.email;
            const filter = {email: email};
            const result = await CartCollections.find(filter).toArray();
            res.send(result);
        })
        //get specific carts
        app.get('/carts/:id',async(req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await CartCollections.findOne(filter);
            res.send(result);
        })

        //delete items from carts
        app.delete('/carts/:id',async(req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await CartCollections.deleteOne(filter);
            res.send(result);
        })

        //update cart items
        app.put('/carts/:id',async(req,res)=>{
            const id = req.params.id;
            const {quantity}= req.body;
            const filter = { _id: new ObjectId(id) };
            const options = {upsert:true};

            const updateDoc = {
                $set: {
                  quantity:parseInt(quantity,10)
                },
              };
              const result = await CartCollections.updateOne(filter, updateDoc, options);
          
        })

        //get all books from database
        // app.get("/all-books", async (req,res)=>{
        //     const books =  bookCollections.find();
        //     const result = await books.toArray();
        //     res.send(result);
        // })
        
        //update a book data : patch or update methods
        app.patch("/book/:id", async (req,res)=>{
            const id = req.params.id;
            // console.log(id);
            const updateBookData = req.body;
            const filter = {_id: new ObjectId(id)};
            const updateDoc = {
                $set: {
                    ...updateBookData
                },
            }
            const option = {upsert:true};   
            //update
            const result = await bookCollections.updateOne(filter, updateDoc,option);
            res.send(result);
         })

         //delete a book data
         app.delete("/book/:id", async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const results = await bookCollections.deleteOne(filter);
            res.send(results);
         })

         //find by category
         app.get("/all-books", async (req,res)=>{
            let query = {};
            if(req.query?.category){
                query = {category: req.query.category}
            }
            const results = await bookCollections.find(query).toArray();
            res.send(results);
         })

         //to get single book
         app.get("/book/:id", async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await bookCollections.findOne(filter);
            res.send(result); 
         })

         //stripe payments routes
         app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            const amount = price*100;
          });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})