const { MongoClient } = require('mongodb');
const mysql = require('mysql2');
const Table = require('cli-table');

const mongodbConfig = {
	url: 'mongodb://localhost:27017',
	databaseName: 'miBaseDeDatos',
	collectionName: 'miColeccion',
	numberOfDocuments: 100000,
};

const mysqlConfig = {
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'pruebas',
};

const tableName = 'Users';
const numberOfRecords = 100000;

async function connectToMongoDB() {
	const client = new MongoClient(mongodbConfig.url, { useUnifiedTopology: true });
	await client.connect();
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
	return duration;
}

async function readDocuments(client) {
	const db = client.db(mongodbConfig.databaseName);
	const collection = db.collection(mongodbConfig.collectionName);

	const startTime = Date.now();

	const documents = await collection.find({}).toArray();

	const endTime = Date.now();
	const duration = endTime - startTime;
	return duration;
}

async function closeMongoDBConnection(client) {
	await client.close();
}

function generateRandomData(index) {
	return [
		`Ejemplo${index}`,
		Math.floor(Math.random() * 100),
		`Ciudad${index}`,
	];
}

let connection;

async function connectToMySQL() {
	connection = mysql.createConnection(mysqlConfig);
	connection.connect();
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
		return duration;
	} catch (error) {
		console.error('Error al insertar datos en MySQL:', error);
	}
}

async function readRecords(connection) {
	const startTime = Date.now();

	try {
		await connection.promise().execute(`SELECT * FROM ${tableName}`);
		const endTime = Date.now();
		const duration = endTime - startTime;
		return duration;
	} catch (error) {
		console.error('Error al leer datos en MySQL:', error);
	}
}

async function main() {
	try {
		const mongoClient = await connectToMongoDB();
		const mongoInsertDuration = await insertDocuments(mongoClient);
		const mongoReadDuration = await readDocuments(mongoClient);
		await closeMongoDBConnection(mongoClient);

		const mysqlConnection = await connectToMySQL();
		const mysqlInsertDuration = await insertRecords(mysqlConnection);
		const mysqlReadDuration = await readRecords(mysqlConnection);

		const table = new Table({
			head: ['Operación', 'MongoDB (ms)', 'MySQL (ms)'],
		});

		table.push(
			['Inserción', mongoInsertDuration, mysqlInsertDuration],
			['Lectura', mongoReadDuration, mysqlReadDuration]
		);

		console.log(table.toString());
	} catch (error) {
		console.error('Error en el programa:', error);
	} finally {
		connection.end();
	}
}

main();
