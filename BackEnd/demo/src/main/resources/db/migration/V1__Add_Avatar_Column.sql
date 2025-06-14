-- Add avatar column to users table
ALTER TABLE users ADD COLUMN avatar VARCHAR(255);

-- Set default avatar for existing users (optional)
UPDATE users SET avatar = 'https://via.placeholder.com/100x100?text=User' WHERE avatar IS NULL;
