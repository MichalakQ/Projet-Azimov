import * as mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asimut',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    allowPublicKeyRetrieval: true
});
 

export const testConnection = async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('✅ Connexion MariaDB établie');
        return true;
    } catch (err) {
        console.error('❌ Erreur MariaDB :', err.message);
        return false;
    } finally {
        if (conn) conn.release();
    }
};

export default pool;
