/* eslint-disable no-unused-vars */
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
/* eslint-disable no-unused-vars */

/**
 *
 * @param {Express} app
 */
function mapRoutes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/users/me', UsersController.getProfile);
  app.post('/files', FilesController.postUpload);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
}

export default mapRoutes;
