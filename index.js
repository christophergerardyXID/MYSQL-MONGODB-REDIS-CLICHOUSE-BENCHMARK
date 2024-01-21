const { MongoClient } = require('mongodb');
const mysql = require('mysql2');
const Table = require('cli-table');

const mongodbConfig = {
	url: 'mongodb://localhost:27017',
	databaseName: 'miBaseDeDatos',
	collectionName: 'miColeccion',
	numberOfDocuments: 10000,
};

const mysqlConfig = {
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'pruebas',
};

const tableName = 'Users';
const numberOfRecords = 1000;

async function connectToMongoDB() {
	const client = new MongoClient(mongodbConfig.url, { useUnifiedTopology: true });
	await client.connect();
	console.log('Conectado a MongoDB');
	return client;
}

async function insertDocuments(client) {
	const db = client.db(mongodbConfig.databaseName);
	const collection = db.collection(mongodbConfig.collectionName);

	const initialDocumentCount = await collection.countDocuments();

	const startTime = Date.now();
	const documents = [];

	for (let i = 0; i < mongodbConfig.numberOfDocuments; i++) {
		documents.push({
			nombre: `Ejemplo${i}`,
			edad: Math.floor(Math.random() * 100),
			ciudad: `Ciudad${i}`,
		});
	}

	await collection.insertMany(documents);

	const finalDocumentCount = await collection.countDocuments();

	const endTime = Date.now();
	const duration = endTime - startTime;
	console.log(`Inserción en MongoDB completada en ${duration} milisegundos`);
	console.log(`Número de registros insertados en MongoDB: ${finalDocumentCount - initialDocumentCount}`);
}

async function readDocuments(client) {
	const db = client.db(mongodbConfig.databaseName);
	const collection = db.collection(mongodbConfig.collectionName);

	const startTime = Date.now();

	const documents = await collection.find({}).toArray();

	const endTime = Date.now();
	const duration = endTime - startTime;
	console.log(`Lectura en MongoDB completada en ${duration} milisegundos`);
	console.log(`Número total de registros en MongoDB: ${documents.length}`);
}

async function closeMongoDBConnection(client) {
	await client.close();
	console.log('Conexión cerrada con MongoDB');
}

function generateRandomData(index) {
	return [
		`Ejemplo${index}`,
		Math.floor(Math.random() * 100),
		`Ciudad${index}`,
	];
}

async function connectToMySQL() {
	const connection = mysql.createConnection(mysqlConfig);
	connection.connect();
	console.log('Conectado a MySQL');
	return connection;
}

async function insertRecords(connection) {
	const startTime = Date.now();

	try {
		await connection.promise().execute('DROP TABLE IF EXISTS Users');
		await connection.promise().execute(`
      CREATE TABLE Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        edad INT,
        ciudad VARCHAR(255)
      )
    `);

		for (let i = 0; i < numberOfRecords; i++) {
			const data = generateRandomData(i);

			await connection.promise().execute(
				`INSERT INTO ${tableName} (nombre, edad, ciudad) VALUES (?, ?, ?)`,
				data
			);
		}

		const endTime = Date.now();
		const duration = endTime - startTime;
		console.log(`Inserción en MySQL completada en ${duration} milisegundos`);
	} catch (error) {
		console.error('Error al insertar datos en MySQL:', error);
	} finally {
		connection.end();
		console.log('Conexión cerrada con MySQL');
	}
}

async function readRecords(connection) {
	const startTime = Date.now();

	const [rows] = await connection.promise().execute(`SELECT * FROM ${tableName}`);

	const endTime = Date.now();
	const duration = endTime - startTime;
	console.log(`Lectura en MySQL completada en ${duration} milisegundos`);
	console.log(`Número total de registros en MySQL: ${rows.length}`);
}

async function main() {
	try {
		const mongoClient = await connectToMongoDB();
		await insertDocuments(mongoClient);
		await readDocuments(mongoClient);
		await closeMongoDBConnection(mongoClient);

		const mysqlConnection = await connectToMySQL();
		await insertRecords(mysqlConnection);
		await readRecords(mysqlConnection);
	} catch (error) {
		console.error('Error en el programa:', error);
	}
}

main();
