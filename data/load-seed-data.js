const client = require('../lib/client');
// import our seed data:
const plants = require('./plants.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
          INSERT INTO users (email, hash)
          VALUES ($1, $2)
          RETURNING *;
        `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      plants.map(({
        id,
        common_name,
        scientific_name,
        year,
        family_common_name,
        image_url,
        genus,
        family
      }) => {
        return client.query(`
          INSERT INTO plants (
            id,
            common_name,
            scientific_name,
            year,
            family_common_name,
            image_url,
            genus,
            family,
            user_id
            )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `,
        [
          id,
          common_name,
          scientific_name,
          year,
          family_common_name,
          image_url,
          genus,
          family,
          user.id
        ]);
      })
    );
    
    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
}
