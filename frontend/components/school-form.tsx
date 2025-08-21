"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SchoolFormProps {
  school?: {
    id: string
    name: string
    address: string
    contact_email: string
    contact_phone?: string
  } | null
  onSuccess: () => void
  onCancel: () => void
}

export default function SchoolForm({ school, onSuccess, onCancel }: SchoolFormProps) {
  const [formData, setFormData] = useState({
    name: school?.name || "",
    address: school?.address || "",
    contact_email: school?.contact_email || "",
    contact_phone: school?.contact_phone || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = school ? `/api/schools/${school.id}` : "/api/schools"
      const method = school ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error("Failed to save school")
      }
    } catch (error) {
      console.error("Form error:", error)
      alert("Failed to save school. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">School Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter school name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter school address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          placeholder="school@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_phone">Contact Phone (Optional)</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : school ? "Update School" : "Add School"}
        </Button>
      </div>
    </form>
  )
}
