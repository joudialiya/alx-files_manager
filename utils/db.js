import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;
    this.client = null;
    MongoClient.connect(
      uri,
      { useUnifiedTopology: true },
      (error, client) => {
        if (error) {
          console.log(error);
        }
        this.client = client;
        this.client.db().createCollection('users');
        this.client.db().createCollection('files');
      },
    );
  }

  isAlive() {
    return !!this.client;
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
