export interface User {
  id: string
  email: string
  role: "admin" | "teacher"
  full_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  school_name: string
  school_code: string
  address?: string
  contact_person?: string
  phone?: string
  email?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  school_id: string
  student_name: string
  class?: string
  section?: string
  roll_number?: string
  father_name?: string
  mother_name?: string
  date_of_birth?: string
  address?: string
  phone?: string
  photo_url?: string
  id_card_generated: boolean
  created_by: string
  created_at: string
  updated_at: string
}
