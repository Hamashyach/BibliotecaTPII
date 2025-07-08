"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysqlConnection = void 0;
exports.executarComandoSQL = executarComandoSQL;
exports.closeMysqlConnection = closeMysqlConnection;
const mysql2_1 = __importDefault(require("mysql2"));
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'erika2611',
    database: 'biblioteca'
};
exports.mysqlConnection = mysql2_1.default.createConnection(dbConfig);
exports.mysqlConnection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ', err);
        // throw err; // Remova o throw aqui para evitar crash na aplicação
        return;
    }
    console.log('Conexão bem-sucedida com o banco de dados MySQL');
});
function executarComandoSQL(query, valores) {
    return new Promise((resolve, reject) => {
        exports.mysqlConnection.query(query, valores, (err, resultado) => {
            if (err) {
                reject(err);
                // throw err; // Remova o throw aqui também
                return;
            }
            resolve(resultado);
        });
    });
}
function closeMysqlConnection() {
    return new Promise((resolve, reject) => {
        exports.mysqlConnection.end(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
