/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
/* eslint-disable no-unused-vars */

class UsersController {
  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const hashedPassword = sha1(password);
    const userCollection = dbClient.client.db().collection('users');
    const doc = await userCollection.findOne({ email });
    if (doc) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    await userCollection.insertOne({ email, password: hashedPassword });
    const user = await userCollection.findOne({ email });
    res.status(201).json({ id: user._id, email: user.email });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async getProfile(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const userId = await redisClient.get(`auth_${token}`);
      const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
      if (user) {
        res.status(200).json({ id: user._id, email: user.email });
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default UsersController;
