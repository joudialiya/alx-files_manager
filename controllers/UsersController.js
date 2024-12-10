/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import sha1 from 'sha1';
import dbClient from '../utils/db';
/* eslint-disable no-unused-vars */

class UsersController {
  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).end('Missing email');
      return;
    }
    if (!password) {
      res.status(400).end('Missing password');
      return;
    }
    const hashedPassword = sha1(password);
    const userCollection = dbClient.client.db().collection('users');
    const doc = await userCollection.findOne({ email });
    if (doc) {
      res.status(400).end('Already exist');
      return;
    }
    await userCollection.insertOne({ email, password: hashedPassword });
    const user = await userCollection.findOne({ email });
    res.status(201).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
