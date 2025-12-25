const { execSync } = require('child_process');
const path = require('path');

const run = (script) => {
  const full = path.join(__dirname, script);
  console.log(`Running ${full}`);
  execSync(`node ${full}`, { stdio: 'inherit' });
};

try {
  run('categories.js');
  run('products.js');
  run('users.js');
  console.log('All seeders finished');
} catch (err) {
  console.error('Seeding failed', err);
  process.exit(1);
}
