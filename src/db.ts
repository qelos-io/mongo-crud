import {Condition, MongoClient, ObjectId, ServerApiVersion} from 'mongodb';
import {logger} from '@qelos/plugin-play';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let client: MongoClient;

type Doc<T> = Omit<T, '_id'> & {
  _id?: Condition<ObjectId> | string;
}

export function getCollection(name: string) {
  return client.db().collection(name);
}

async function run(uri = process.env.MONGODB_URL || 'mongodb://localhost/db') {
  try {
    client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      }
    );
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db().command({ping: 1});

    logger.log('Pinged your deployment. You successfully connected to MongoDB!');

    return client.db();
  } finally {

  }
}

export function provideMongo(uri = process.env.MONGODB_URL || 'mongodb://localhost/db') {
  return run(uri).catch(process.exit);
}

