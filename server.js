import express from 'express';
import mapRoutes from './routes';

const PORT = process.env.PORT || 5000;

const app = express();
mapRoutes(app);

app.listen(PORT);