import { MongoClient } from 'mongodb';

export default async function createClientDb(app): Promise<MongoClient> {
  const url = app.get('mongodb');
  const database = url.substr(url.lastIndexOf('/') + 1);

  const client = await MongoClient.connect(url, {
    useUnifiedTopology: true,
  });
  return client.db(database);
}
