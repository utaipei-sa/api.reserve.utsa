const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const utsa = client.db('utsa');
const reservations = utsa.collection('reservations');
const spaces = utsa.collection('spaces');
const items = utsa.collection('items');
const spaces_reserved_time = utsa.collection('spaces_reserved_time');
const items_reserved_time = utsa.collection('items_reserved_time');
const users = utsa.collection('users');
module.exports = { reservations, spaces, items, spaces_reserved_time, items_reserved_time, users };

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

//temporary fixed data
async function setup_spaces() {
    const temp_data = [
        {
            name: {
                "zh-tw": "學生活動中心",
                "en": "Student Activity Center"
            }
        }, 
        {
            name: {
                "zh-tw": "勤樸樓B1小舞台",
                "en": "Cin-Pu Building B1 Stage"
            }
        }
    ]
    if (await spaces.countDocuments({}) === 0) {
        await spaces.insertMany(temp_data);
    }
};

async function setup_items() {
    const temp_data = [
        {
            name: {
                "zh-tw": "塑膠椅",
                "en": "Plastic Chairs"
            },
            quantity: 30
        }, 
        {
            name: {
                "zh-tw": "長桌",
                "en": "Tables"
            },
            quantity: 2
        }
    ]
    if (await items.countDocuments({}) === 0) {
        await items.insertMany(temp_data);
    }
};

setup_spaces();
setup_items();