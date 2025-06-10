-- Create entrenamientos table
CREATE TABLE IF NOT EXISTS entrenamientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  video_url TEXT NOT NULL,
  autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE entrenamientos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view workouts" ON entrenamientos
  FOR SELECT USING (true);

CREATE POLICY "Trainers can insert their own workouts" ON entrenamientos
  FOR INSERT WITH CHECK (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'entrenador'
    )
  );

CREATE POLICY "Trainers can update their own workouts" ON entrenamientos
  FOR UPDATE USING (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'entrenador'
    )
  );

CREATE POLICY "Trainers can delete their own workouts" ON entrenamientos
  FOR DELETE USING (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'entrenador'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_entrenamientos_updated_at 
  BEFORE UPDATE ON entrenamientos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
