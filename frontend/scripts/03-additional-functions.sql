-- Create function to get teacher-specific statistics
CREATE OR REPLACE FUNCTION get_teacher_stats(teacher_school_id UUID)
RETURNS TABLE(
  total_students BIGINT,
  photos_uploaded BIGINT,
  pending_photos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM students WHERE school_id = teacher_school_id) as total_students,
    (SELECT COUNT(*) FROM students WHERE school_id = teacher_school_id AND photo_url IS NOT NULL) as photos_uploaded,
    (SELECT COUNT(*) FROM students WHERE school_id = teacher_school_id AND photo_url IS NULL) as pending_photos;
END;
$$ LANGUAGE plpgsql;

-- Create function to get school statistics
CREATE OR REPLACE FUNCTION get_school_stats(target_school_id UUID)
RETURNS TABLE(
  total_students BIGINT,
  total_teachers BIGINT,
  photos_uploaded BIGINT,
  recent_uploads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM students WHERE school_id = target_school_id) as total_students,
    (SELECT COUNT(*) FROM users WHERE school_id = target_school_id AND role = 'teacher') as total_teachers,
    (SELECT COUNT(*) FROM students WHERE school_id = target_school_id AND photo_url IS NOT NULL) as photos_uploaded,
    (SELECT COUNT(*) FROM students WHERE school_id = target_school_id AND photo_url IS NOT NULL AND created_at >= NOW() - INTERVAL '7 days') as recent_uploads;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_photo_status ON students(photo_status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school_role ON users(school_id, role);

-- Create trigger to update photo status
CREATE OR REPLACE FUNCTION update_photo_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set photo status based on photo_url
  IF NEW.photo_url IS NOT NULL AND NEW.photo_url != '' THEN
    NEW.photo_status = 'uploaded';
  ELSE
    NEW.photo_status = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for students table
DROP TRIGGER IF EXISTS trigger_update_photo_status ON students;
CREATE TRIGGER trigger_update_photo_status
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_status();

-- Create storage bucket for student photos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for student photos
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to view photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'student-photos');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'student-photos');
