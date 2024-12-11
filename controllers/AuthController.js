/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
/* eslint-disable no-unused-vars */

class AuthController {
  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async getConnect(req, res) {
    const extractCredentials = new RegExp('Basic (.*)');
    const header = req.headers.authorization;
    const credentials = extractCredentials.exec(header)[1];
    if (credentials) {
      const plainCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
      const [email, password] = plainCredentials.split(':');
      if (email && password) {
        const hashedPassword = sha1(password);
        const user = await dbClient.client.db().collection('users').findOne({ email });
        if (user && user.password === hashedPassword) {
          const token = uuidv4().toString();
          const secondsInOnDay = 86400;
          redisClient.set(`auth_${token}`, user._id.toString(), secondsInOnDay);
          res.status(200).json({ token });
          return;
        }
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`;
      const userId = await redisClient.get(`auth_${token}`);
      const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
      if (user) {
        redisClient.del(key);
        res.status(204).end();
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default AuthController;
