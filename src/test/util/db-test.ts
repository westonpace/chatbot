import { MongoClient, Db, Collection } from 'mongodb';

export class DbTestFixture {

  private collectionsToCleanup: Collection<any>[] = [];

  constructor(private db: Db) {

  }

  getCollection(name: string) {
    const result = this.db.collection(name);
    this.collectionsToCleanup.push(result);
    return result;
  }

  async cleanup() {
    for (const collection of this.collectionsToCleanup) {
      await collection.remove({});
    }
  }

}

export async function prepareDbTest() {
  const mongoClient = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
  const db = mongoClient.db('unittest');
  return new DbTestFixture(db);
}

