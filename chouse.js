const { ClickHouse } = require('clickhouse');
const Table = require('cli-table');

async function insertData() {
	const clickhouse = new ClickHouse({
		url: 'http://localhost',
		port: 8123,
		format: 'json',
		config: {
			session_timeout: 10000000000000,
			database: 'pruebas',

		},
	});

	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS tu_tabla (
												id Int32,
												name String,
												lastname String,
												age Int32,
												pet_name String
		) ENGINE = Memory;
	`;

	const selectQuery = 'SELECT name, lastname FROM tu_tabla';

	const startInsert = new Date();

	try {
		await clickhouse.query(createTableQuery).toPromise();

		for (let index = 0; index < 10000; index++) {
			const insertQuery = `
        INSERT INTO tu_tabla (id, name, lastname, age, pet_name)
        VALUES (${index}, 'Nombre${index}', 'Apellido${index}', ${Math.floor(Math.random() * 100)}, 'Mascota${index}')
      `;

			await clickhouse.query(insertQuery).toPromise();
		}

		const writeTime = new Date() - startInsert;

		const startRead = new Date();
		const result = await clickhouse.query(selectQuery).toPromise();
		const readTime = new Date() - startRead;

		const table = new Table();
		table.push(
			{ 'Tiempo de escritura': `${writeTime} ms` },
			{ 'Tiempo de lectura': `${readTime} ms` }
		);

		console.log(table.toString());
	} catch (error) {
		console.error('Error:', error);
	}
}

insertData();
