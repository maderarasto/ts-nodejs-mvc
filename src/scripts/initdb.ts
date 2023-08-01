import DB from '../framework/Database/DB';

async function init() {
    await DB.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT(11) NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            login VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255),

            CONSTRAINT PK_user PRIMARY KEY (id),
            CONSTRAINT UC_user UNIQUE (login)
        );
    `);
}

DB.init();
init().then(() => {
    console.log('Scripts finished successfully');
    DB.close();
});
