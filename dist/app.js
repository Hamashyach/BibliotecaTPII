"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./route/routes");
const Swagger_1 = require("./config/Swagger");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3040;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const projectRoot = process.cwd();
const frontEndPath = path_1.default.join(projectRoot, 'frontend');
app.use(express_1.default.static(frontEndPath));
const apiRouter = express_1.default.Router();
(0, routes_1.RegisterRoutes)(apiRouter);
app.use('/api', apiRouter);
(0, Swagger_1.setupSwagger)(app);
app.listen(PORT, () => {
    console.log(`Servidor pronto e rodando na porta: ${PORT}`);
    console.log(`Veja a documentação da API em: http://localhost:${PORT}/api-docs`);
    console.log(`Acesse o front-end em: http://localhost:${PORT}`);
});
