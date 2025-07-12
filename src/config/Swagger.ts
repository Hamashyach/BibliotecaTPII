import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import fs from 'fs';

export const setupSwagger = (app: Express) => {
    try {
        
        const swaggerFilePath = path.resolve(__dirname, '../../dist/swagger.json');
    
        if (fs.existsSync(swaggerFilePath)) {
            const swaggerSpec = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));
            app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        } else {
            console.warn('Swagger.json não encontrado. Execute "npm run build" para gerá-lo.');
            app.use('/api-docs', (req, res) => {
                res.send('Documentação não disponível. Execute `npm run build`.');
            });
        }
    } catch (error) {
        console.error('Falha ao carregar a documentação do Swagger:', error);
    }
};