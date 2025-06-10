-- Create compras table
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrenamiento', 'nutricion')),
  plan_id UUID NOT NULL,
  precio DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases" ON compras
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON compras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compras_user_id ON compras(user_id);
CREATE INDEX IF NOT EXISTS idx_compras_tipo ON compras(tipo);
CREATE INDEX IF NOT EXISTS idx_compras_created_at ON compras(created_at);
