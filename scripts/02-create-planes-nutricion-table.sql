-- Create planes_nutricion table
CREATE TABLE IF NOT EXISTS planes_nutricion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE planes_nutricion ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view nutrition plans" ON planes_nutricion
  FOR SELECT USING (true);

CREATE POLICY "Nutritionists can insert their own plans" ON planes_nutricion
  FOR INSERT WITH CHECK (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'nutricionista'
    )
  );

CREATE POLICY "Nutritionists can update their own plans" ON planes_nutricion
  FOR UPDATE USING (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'nutricionista'
    )
  );

CREATE POLICY "Nutritionists can delete their own plans" ON planes_nutricion
  FOR DELETE USING (
    auth.uid() = autor_id AND 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'nutricionista'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_planes_nutricion_updated_at 
  BEFORE UPDATE ON planes_nutricion 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
