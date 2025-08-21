import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication and admin role
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const schoolId = formData.get("schoolId") as string

    if (!file || !schoolId) {
      return NextResponse.json({ error: "Missing file or school ID" }, { status: 400 })
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      return NextResponse.json({ error: "Excel file is empty" }, { status: 400 })
    }

    const results = {
      success: true,
      total: jsonData.length,
      inserted: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    }

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      const rowNumber = i + 2 // Excel row number (accounting for header)

      try {
        // Validate required fields
        const requiredFields = ["Name", "Class", "Roll Number"]
        const missingFields = requiredFields.filter((field) => !row[field])

        if (missingFields.length > 0) {
          results.errors.push({
            row: rowNumber,
            error: `Missing required fields: ${missingFields.join(", ")}`,
            data: row,
          })
          continue
        }

        // Prepare student data
        const studentData = {
          name: String(row["Name"]).trim(),
          class_name: String(row["Class"]).trim(),
          roll_number: String(row["Roll Number"]).trim(),
          school_id: schoolId,
          date_of_birth: row["Date of Birth"] ? new Date(row["Date of Birth"]).toISOString().split("T")[0] : null,
          gender: row["Gender"] ? String(row["Gender"]).trim() : null,
          father_name: row["Father Name"] ? String(row["Father Name"]).trim() : null,
          mother_name: row["Mother Name"] ? String(row["Mother Name"]).trim() : null,
          address: row["Address"] ? String(row["Address"]).trim() : null,
          phone: row["Phone"] ? String(row["Phone"]).trim() : null,
        }

        // Check for duplicate roll number in the same school
        const { data: existingStudent } = await supabase
          .from("students")
          .select("id")
          .eq("school_id", schoolId)
          .eq("roll_number", studentData.roll_number)
          .single()

        if (existingStudent) {
          results.errors.push({
            row: rowNumber,
            error: `Student with roll number ${studentData.roll_number} already exists`,
            data: row,
          })
          continue
        }

        // Insert student
        const { error: insertError } = await supabase.from("students").insert(studentData)

        if (insertError) {
          results.errors.push({
            row: rowNumber,
            error: `Database error: ${insertError.message}`,
            data: row,
          })
        } else {
          results.inserted++
        }
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: `Processing error: ${error}`,
          data: row,
        })
      }
    }

    // Update success status
    results.success = results.inserted > 0

    return NextResponse.json(results)
  } catch (error) {
    console.error("Excel upload error:", error)
    return NextResponse.json({ error: "Failed to process Excel file" }, { status: 500 })
  }
}
