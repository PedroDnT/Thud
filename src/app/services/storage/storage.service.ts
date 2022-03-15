import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import FeedCache from '../../models/FeedCache';
import * as moment from 'moment';
import Collection from 'src/app/models/Collection';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  initialize(): Promise<any> {
    return new Promise(async (resolve) => {
      console.log('Initializing...');
      const collections = await Storage.get({ key: 'collections' });
      if (!collections.value) await Storage.set({ key: 'collections', value: JSON.stringify([]) });
      
      const cache = await Storage.get({ key: 'cache' });
      if (!cache.value) await Storage.set({ key: 'cache', value: JSON.stringify([]) });

      resolve(true);
    });
  }

  getCollections(): Promise<Collection[]> {
    return new Promise(async (resolve) => {
      const collections = await Storage.get({ key: 'collections' });
      resolve(JSON.parse(collections.value));
    });
  }

  getCollectionByFeedId(feedId: string): Promise<Collection> {
    return new Promise(async (resolve) => {
      const collections = await this.getCollections();
      const collection: Collection = collections.find(item => item.feedIds.includes(feedId));
      resolve(collection);
    });
  }

  setCollections(collections: Collection[]): Promise<Collection[]> {
    return new Promise(async (resolve) => {
      await Storage.set({ key: 'collections', value: JSON.stringify(collections) });
      resolve(collections);
    });
  }

  addCollection(collection: Collection): Promise<Collection> {
    return new Promise(async (resolve) => {
      const collections = await this.getCollections();
      collections.push(collection);
      await this.setCollections(collections);
      resolve(collection);
    });
  }

  updateCollection(collection: Collection): Promise<Collection> {
    return new Promise(async (resolve) => {
      const collections = await this.getCollections();
      const index = collections.findIndex(item => item.id === collection.id);
      collections[index] = collection;
      await this.setCollections(collections);
      resolve(collection);
    });
  }

  deleteCollection(collection: Collection): Promise<Collection> {
    return new Promise(async (resolve) => {
      const collections = await this.getCollections();
      const index = collections.findIndex(item => item.id === collection.id);
      collections.splice(index, 1);
      await this.setCollections(collections);
      resolve(collection);
    });
  }

  getCacheByFeedId(feedId: string): Promise<FeedCache> {
    return new Promise(async (resolve) => {
      const cache = await Storage.get({ key: 'cache' });
      const cacheList: FeedCache[] = JSON.parse(cache.value);
      const cacheItem: FeedCache = cacheList.find(item => item.feedId === feedId);
      resolve(cacheItem);
    });
  }

  setCacheByFeedId(feedId: string, content: any): Promise<FeedCache> {
    return new Promise(async (resolve) => {
      const cache = await Storage.get({ key: 'cache' });
      const cacheList: FeedCache[] = JSON.parse(cache.value);
      const cacheItem: FeedCache = cacheList.find(item => item.feedId === feedId);
      if (cacheItem) {
        cacheItem.content = content;
        cacheItem.fetchedAt = moment().unix();
      } else {
        cacheList.push({ feedId, fetchedAt: moment().unix(), content });
      }
      await Storage.set({ key: 'cache', value: JSON.stringify(cacheList) });
      resolve(cacheItem);
    });
  }

  deleteCacheByFeedId(feedId: string): Promise<FeedCache> {
    return new Promise(async (resolve) => {
      const cache = await Storage.get({ key: 'cache' });
      const cacheList: FeedCache[] = JSON.parse(cache.value);
      const cacheItem: FeedCache = cacheList.find(item => item.feedId === feedId);
      if (cacheItem) {
        cacheList.splice(cacheList.indexOf(cacheItem), 1);
        await Storage.set({ key: 'cache', value: JSON.stringify(cacheList) });
      }
      resolve(cacheItem);
    });
  }

  deleteCache(): Promise<boolean> {
    return new Promise(async (resolve) => {
      await Storage.set({ key: 'cache', value: JSON.stringify([]) });
      resolve(true);
    });
  }

}
