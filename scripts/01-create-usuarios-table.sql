-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('cliente', 'entrenador', 'nutricionista')),
  avatar_url TEXT,
  bio TEXT,
  gimnasio TEXT,
  ciudad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_usuarios_updated_at 
  BEFORE UPDATE ON usuarios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
