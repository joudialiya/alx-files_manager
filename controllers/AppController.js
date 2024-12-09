/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import dbClient from '../utils/db';
/* eslint-disable no-unused-vars */

class AppController {
  /**
   * @param {Request} req
   * @param {Response} res
   */
  static getStatus(req, res) {
    res.status(200).send({ redis: true, db: true });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   */
  static async getStats(req, res) {
    res.status(200).send(
      { users: await dbClient.nbUsers(), files: await dbClient.nbFiles() },
    );
  }
}

export default AppController;
