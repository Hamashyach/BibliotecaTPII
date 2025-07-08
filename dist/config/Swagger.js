"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const setupSwagger = (app) => {
    try {
        // CORREÇÃO: O caminho agora aponta para a pasta 'dist' onde o arquivo é gerado.
        const swaggerFilePath = path_1.default.resolve(__dirname, '../../dist/swagger.json');
        // Verifica se o arquivo existe antes de tentar lê-lo
        if (fs_1.default.existsSync(swaggerFilePath)) {
            const swaggerSpec = JSON.parse(fs_1.default.readFileSync(swaggerFilePath, 'utf8'));
            app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
        }
        else {
            console.warn('Swagger.json não encontrado. Execute "npm run build" para gerá-lo.');
            // Opcional: criar uma rota placeholder para /api-docs
            app.use('/api-docs', (req, res) => {
                res.send('Documentação não disponível. Execute `npm run build`.');
            });
        }
    }
    catch (error) {
        console.error('Falha ao carregar a documentação do Swagger:', error);
    }
};
exports.setupSwagger = setupSwagger;
