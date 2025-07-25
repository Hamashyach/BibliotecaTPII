import mysql, { Connection } from 'mysql2';

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'ifsp',
    database: 'biblioteca'
};

export const mysqlConnection: Connection = mysql.createConnection(dbConfig);

mysqlConnection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ', err);
    
        return;
    }
    console.log('Conexão bem-sucedida com o banco de dados MySQL');
});

export function executarComandoSQL(query: string, valores: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        mysqlConnection.query(query, valores, (err, resultado: any) => {
            if (err) {
                reject(err);
        
                return;
            }
            resolve(resultado);
        });
    });
}

export function closeMysqlConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
        mysqlConnection.end(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}