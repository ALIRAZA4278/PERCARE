-- Add monthly_expense_goal and monthly_donation_goal to shelters
ALTER TABLE shelters ADD COLUMN IF NOT EXISTS monthly_expense_goal DECIMAL DEFAULT 50000;
ALTER TABLE shelters ADD COLUMN IF NOT EXISTS monthly_donation_goal DECIMAL DEFAULT 80000;

-- Add bank details to shelters
ALTER TABLE shelters ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE shelters ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Shelter Expenses table
CREATE TABLE IF NOT EXISTS shelter_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  category TEXT DEFAULT 'Other',
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shelter_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shelter owners can manage expenses" ON shelter_expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shelters WHERE shelters.id = shelter_expenses.shelter_id AND shelters.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_shelter_expenses_shelter ON shelter_expenses(shelter_id);
CREATE INDEX IF NOT EXISTS idx_shelter_expenses_date ON shelter_expenses(expense_date);

-- Shelter Budget Categories table
CREATE TABLE IF NOT EXISTS shelter_budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  budget DECIMAL DEFAULT 0,
  spent DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shelter_budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shelter owners can manage budget categories" ON shelter_budget_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shelters WHERE shelters.id = shelter_budget_categories.shelter_id AND shelters.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_budget_categories_shelter ON shelter_budget_categories(shelter_id);

-- Intake Records table
CREATE TABLE IF NOT EXISTS intake_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT,
  species TEXT NOT NULL,
  breed TEXT,
  estimated_age TEXT,
  source TEXT,
  health_condition TEXT,
  notes TEXT,
  moved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE intake_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shelter owners can manage intake records" ON intake_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shelters WHERE shelters.id = intake_records.shelter_id AND shelters.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_intake_records_shelter ON intake_records(shelter_id);

-- Add delete policy for shelter_animals
CREATE POLICY "Shelter owners can delete animals" ON shelter_animals FOR DELETE USING (
  EXISTS (SELECT 1 FROM shelters WHERE shelters.id = shelter_animals.shelter_id AND shelters.owner_id = auth.uid())
);
