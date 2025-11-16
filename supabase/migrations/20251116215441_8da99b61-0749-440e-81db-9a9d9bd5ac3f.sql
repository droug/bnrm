-- Create space_availabilities table to manage rental space availability by date and time periods
CREATE TABLE IF NOT EXISTS space_availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES rental_spaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(space_id, date, start_time)
);

-- Create index for better query performance
CREATE INDEX idx_space_availabilities_space_date ON space_availabilities(space_id, date);
CREATE INDEX idx_space_availabilities_date ON space_availabilities(date);

-- Enable RLS
ALTER TABLE space_availabilities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view space availabilities"
  ON space_availabilities
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage space availabilities"
  ON space_availabilities
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_space_availabilities
  BEFORE UPDATE ON space_availabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();