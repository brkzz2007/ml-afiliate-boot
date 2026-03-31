const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all('SELECT * FROM queue', [], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('--- CONTEÚDO DA FILA ---');
  console.log(rows);
  console.log('--- FIM ---');
  db.close();
});
