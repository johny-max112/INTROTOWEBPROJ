const pool = require('./db');

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Add user_id to announcements table if it doesn't exist
    try {
      await pool.query(`ALTER TABLE announcements ADD COLUMN user_id INT`);
      await pool.query(`ALTER TABLE announcements ADD CONSTRAINT fk_announcements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`);
      console.log('✓ Added user_id to announcements table');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ user_id already exists in announcements table');
      } else {
        throw e;
      }
    }
    
    // Add user_id to events table if it doesn't exist
    try {
      await pool.query(`ALTER TABLE events ADD COLUMN user_id INT`);
      await pool.query(`ALTER TABLE events ADD CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`);
      console.log('✓ Added user_id to events table');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ user_id already exists in events table');
      } else {
        throw e;
      }
    }
    
    // Alter comments table to support announcement and event types
    await pool.query(`ALTER TABLE comments MODIFY COLUMN parent_type ENUM('announcement','event','suggestion','discussion')`);
    console.log('✓ Updated comments table');
    
    // Alter likes table to support announcement and event types
    await pool.query(`ALTER TABLE likes MODIFY COLUMN parent_type ENUM('announcement','event','suggestion','discussion')`);
    console.log('✓ Updated likes table');
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateDatabase();
