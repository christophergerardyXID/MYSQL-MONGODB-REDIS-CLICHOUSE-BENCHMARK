const Redis = require('ioredis');
const { promisify } = require('util');
const Table = require('cli-table');

const redis = new Redis('redis://localhost:6379');

const setAsync = promisify(redis.set).bind(redis);
const getAsync = promisify(redis.get).bind(redis);

async function main() {
	const key = 'miClave';

	const jsonArrayData = [];

	for (let i = 0; i <1000000 ; i++) {
		jsonArrayData.push({ id: 0, nombre: "Ejemplo", edad: 25, ciudad: "Ciudad Ejemplo"});
	}

	// Medir tiempo de escritura
	const startWriteTime = Date.now();
	const setResult = await setAsync(key, JSON.stringify(jsonArrayData));
	const writeTime = Date.now() - startWriteTime;

	// Medir tiempo de lectura
	const startReadTime = Date.now();
	const storedJsonArray = await getAsync(key);
	const readTime = Date.now() - startReadTime;

	// Configurar las tablas
	const writeTable = new Table({ head: ['Operación', 'Key', 'Resultado', 'Tiempo (ms)'] });
	const readTable = new Table({ head: ['Operación', 'Key', 'Tiempo (ms)'] });

	// Agregar datos a las tablas
	writeTable.push(['Escritura', key, setResult, writeTime]);
	readTable.push(['Lectura', key, readTime]);

	// Mostrar tablas
	console.log('\nResultados de Escritura:\n', writeTable.toString());
	console.log('\nResultados de Lectura:\n', readTable.toString());

	redis.quit(); // Cerrar la conexión a Redis
}

main();
