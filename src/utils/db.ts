import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MusicPlayerDB extends DBSchema {
  songs: {
    key: number;
    value: SongData;
    indexes: { 'by-addedAt': number };
  };
}

export interface SongData {
  id?: number;
  name: string;
  artist: string;
  file: Blob;
  duration: number;
  addedAt: number;
}

const DB_NAME = 'MusicPlayerDB';
const STORE_NAME = 'songs';

class MusicDB {
  private dbPromise: Promise<IDBPDatabase<MusicPlayerDB>>;

  constructor() {
    this.dbPromise = openDB<MusicPlayerDB>(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-addedAt', 'addedAt');
      },
    });
  }

  async addSong(song: Omit<SongData, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return db.add(STORE_NAME, song);
  }

  async getAllSongs(): Promise<SongData[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex(STORE_NAME, 'by-addedAt');
  }

  async getSongById(id: number): Promise<SongData | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  async deleteSong(id: number): Promise<void> {
    const db = await this.dbPromise;
    return db.delete(STORE_NAME, id);
  }
}

export const musicDB = new MusicDB();
