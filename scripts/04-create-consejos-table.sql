-- Create consejos table
CREATE TABLE IF NOT EXISTS consejos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  video_url TEXT,
  categoria TEXT,
  autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE consejos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view advice" ON consejos
  FOR SELECT USING (true);

CREATE POLICY "Professionals can insert advice" ON consejos
  FOR INSERT WITH CHECK (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol IN ('entrenador', 'nutricionista')
    )
  );

CREATE POLICY "Professionals can update their own advice" ON consejos
  FOR UPDATE USING (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol IN ('entrenador', 'nutricionista')
    )
  );

CREATE POLICY "Professionals can delete their own advice" ON consejos
  FOR DELETE USING (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol IN ('entrenador', 'nutricionista')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_consejos_updated_at 
  BEFORE UPDATE ON consejos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
