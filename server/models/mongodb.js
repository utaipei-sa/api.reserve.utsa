const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const utsa = client.db('utsa');
const reservations = utsa.collection('reservations');
const users = utsa.collection('users');
module.exports = { reservations, users };

/*
async function run() {
    try {
        const database = client.db('utsa');
        const reservations = database.collection('reservations');
        const users = database.collection('users');
        // Query for a movie that has the title 'Back to the Future'
        const query = { title: 'Back to the Future' };
        const reservation = await reservations.findOne(query);
        console.log(reservation);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
*/