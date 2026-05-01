const { base44 } = require('./src/api/base44Client');

async function checkCategories() {
  try {
    const data = await base44.db.getTable('user_categories');
    console.log('Categories in DB:', data);
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

checkCategories();
