-- Add additional fields to students table for Excel upload data
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for better performance on roll number lookups
CREATE INDEX IF NOT EXISTS idx_students_school_roll ON students(school_id, roll_number);

-- Create function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE(
  total_schools BIGINT,
  total_teachers BIGINT,
  total_students BIGINT,
  photos_uploaded BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM schools) as total_schools,
    (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE photo_url IS NOT NULL) as photos_uploaded;
END;
$$ LANGUAGE plpgsql;
