/* eslint-disable no-unused-vars */
import { Express } from 'express';
import AppController from '../controllers/AppController';
/* eslint-disable no-unused-vars */

/**
 *
 * @param {Express} app
 */
function mapRoutes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
}

export default mapRoutes;
