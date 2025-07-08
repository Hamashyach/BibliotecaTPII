import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { RegisterRoutes } from './route/routes';
import { setupSwagger } from './config/Swagger';

const app = express();
const PORT = 3040;

app.use(express.json());

const projectRoot = process.cwd();
const frontEndPath = path.join(projectRoot, 'front');

app.use(express.static(frontEndPath));

const apiRouter = express.Router();
RegisterRoutes(apiRouter);
app.use('/api', apiRouter);

//app.get('/', (req: Request, res: Response) => {
      ///res.sendFile(path.join(frontEndPath, 'login.html'));
//});

setupSwagger(app);

app.listen(PORT, () => {
    console.log(`Servidor pronto e rodando na porta: ${PORT}`);
    console.log(`Veja a documentação da API em: http://localhost:${PORT}/api-docs`);
});