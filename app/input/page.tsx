"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Bell, Clock, Pill } from "lucide-react"

export default function InputPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    reminderTime: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save prescription")
      }

      // Set up voice reminder
      setupVoiceReminder(formData.medicineName, formData.reminderTime)

      toast({
        title: "Prescription saved!",
        description: "Your medicine reminder has been set.",
      })

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const setupVoiceReminder = (medicineName: string, reminderTime: string) => {
    // This is a simplified implementation for demo purposes
    // In a real app, you would need to handle background processes and notifications
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }

    // Show a demo of the voice reminder
    const utterance = new SpeechSynthesisUtterance(`This is a reminder to take your medicine ${medicineName}`)
    speechSynthesis.speak(utterance)

    // In a real implementation, you would set up a timer based on reminderTime
    // and trigger the voice reminder at the specified time
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add Prescription</CardTitle>
            <CardDescription>Enter your medicine details and set a reminder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medicineName">Medicine Name</Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="medicineName"
                    name="medicineName"
                    placeholder="Enter medicine name"
                    className="pl-10"
                    value={formData.medicineName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  name="dosage"
                  placeholder="e.g., 1 tablet, 5ml, etc."
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reminderTime"
                    name="reminderTime"
                    type="time"
                    className="pl-10"
                    value={formData.reminderTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    Save & Set Reminder
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-xs text-muted-foreground">
              <Bell className="inline h-3 w-3 mr-1" />
              Voice reminders will be set based on the time you provide
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      <Toaster />
    </div>
  )
}
