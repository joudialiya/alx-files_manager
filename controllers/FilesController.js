/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { mkdirSync, writeFileSync } from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
/* eslint-disable no-unused-vars */

class FilesController {
  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
      if (user) {
        const file = req.body;
        if (!file.name) {
          res.status(400).json({ error: 'Missing name' });
          return;
        }
        if (!file.type || !['folder', 'file', 'image'].includes(file.type)) {
          res.status(400).json({ error: 'Missing type' });
          return;
        }
        if (!file.data && file.type !== 'folder') {
          res.status(400).json({ error: 'Missing data' });
          return;
        }
        if (file.parentId) {
          const parent = await dbClient.client.db().collection('files').findOne({ _id: new ObjectId(file.parentId) });
          if (!parent) {
            res.status(400).json({ error: 'Parent not found' });
            return;
          }
          if (parent.type !== 'folder') {
            res.status(400).json({ error: 'Parent is not a folder' });
            return;
          }
        }
        if (file.type === 'folder') {
          const fileDoc = {
            userId,
            name: file.name,
            type: file.type,
            isPublic: file.isPublic || false,
            parentId: file.parentId || 0,
          };
          dbClient.client.db().collection('files').insertOne(fileDoc);
          res.status(201).json({
            id: fileDoc._id,
            userId: fileDoc.userId,
            name: fileDoc.name,
            type: fileDoc.type,
            isPublic: fileDoc.isPublic,
            parentId: fileDoc.parentId,
          });
          return;
        }
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
        const localPath = `${FOLDER_PATH}/${uuidv4()}`;
        const data = Buffer.from(file.data, 'base64');
        mkdirSync(FOLDER_PATH, { recursive: true });
        writeFileSync(localPath, data);
        const fileDoc = {
          userId,
          name: file.name,
          type: file.type,
          isPublic: file.isPublic || false,
          parentId: file.parentId || 0,
          localPath,
        };
        dbClient.client.db().collection('files').insertOne(fileDoc);
        res.status(201).json({
          id: fileDoc._id,
          userId: fileDoc.userId,
          name: fileDoc.name,
          type: fileDoc.type,
          isPublic: fileDoc.isPublic,
          parentId: fileDoc.parentId,
          localPath: fileDoc.localPath,
        });
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
      if (user) {
        const id = req.params.id || '';
        const file = await dbClient.client.db().collection('files').findOne({ _id: new ObjectId(id), userId });
        if (!file) {
          res.status(404).json({ error: 'Not found' });
          return;
        }
        file.id = file._id;
        delete file._id;
        res.status(200).json(file);
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
      if (user) {
        const parentId = req.query.parentId || 0;
        const page = req.query.page || 0;
        const cursor = dbClient.client.db().collection('files').aggregate([
          { $match: { parentId } },
          { $skip: 20 * page },
          { $limit: 20 },
        ]);
        const docs = [];
        for await (const doc of cursor) {
          doc.id = doc._id;
          delete doc._id;
          docs.push(doc);
        }
        res.status(200).json(docs);
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default FilesController;
