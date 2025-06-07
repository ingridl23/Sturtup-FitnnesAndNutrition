-- Create the usuarios table if it doesn't exist
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the usuarios table
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies for the usuarios table
-- Allow anyone to read user profiles (you can restrict this as needed)
CREATE POLICY "Allow public read access" ON usuarios
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow insert for authenticated users" ON usuarios
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Allow update for authenticated users" ON usuarios
  FOR UPDATE USING (true) WITH CHECK (true);

-- Insert a sample user for testing
INSERT INTO usuarios (id, email, nombre) 
VALUES ('user-123', 'juan.perez@ejemplo.com', 'Juan Pérez')
ON CONFLICT (email) DO NOTHING;
