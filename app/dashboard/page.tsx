"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Clock, Pill, Trash2, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Skeleton } from "@/components/ui/skeleton"
import ReminderService from "@/components/reminder-service"
import { Badge } from "@/components/ui/badge"

interface Prescription {
  _id: string
  medicineName: string
  dosage: string
  reminderTime: string
  createdAt: string
  taken?: boolean
}

export default function DashboardPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [upcomingReminders, setUpcomingReminders] = useState<Prescription[]>([])

  useEffect(() => {
    fetchPrescriptions()

    // Set up interval to refresh prescriptions every minute
    const intervalId = setInterval(fetchPrescriptions, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch("/api/prescriptions")
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions")
      }
      const data = await response.json()
      setPrescriptions(data)

      // Calculate upcoming reminders
      calculateUpcomingReminders(data)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load prescriptions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateUpcomingReminders = (prescriptions: Prescription[]) => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Convert current time to minutes since midnight for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Map prescriptions to include time in minutes and filter out past reminders for today
    const reminderTimes = prescriptions.map((prescription) => {
      const [hours, minutes] = prescription.reminderTime.split(":").map(Number)
      const timeInMinutes = hours * 60 + minutes

      return {
        ...prescription,
        timeInMinutes: timeInMinutes,
        // If the reminder time has passed for today, add 24 hours (1440 minutes)
        adjustedTimeInMinutes: timeInMinutes <= currentTimeInMinutes ? timeInMinutes + 1440 : timeInMinutes,
      }
    })

    // Sort by adjusted time to get the next upcoming reminders
    const sortedReminders = reminderTimes.sort((a, b) => a.adjustedTimeInMinutes - b.adjustedTimeInMinutes)

    // Take the next 3 upcoming reminders
    setUpcomingReminders(sortedReminders.slice(0, 3))
  }

  const deletePrescription = async (id: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete prescription")
      }

      // Remove the deleted prescription from the state
      setPrescriptions(prescriptions.filter((p) => p._id !== id))

      // Recalculate upcoming reminders
      calculateUpcomingReminders(prescriptions.filter((p) => p._id !== id))

      toast({
        title: "Prescription deleted",
        description: "The prescription has been removed successfully.",
      })
    } catch (error) {
      console.error("Error deleting prescription:", error)
      toast({
        title: "Error",
        description: "Failed to delete prescription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const markAsTaken = async (id: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${id}/taken`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to mark prescription as taken")
      }

      // Update the prescription in the state
      setPrescriptions(prescriptions.map((p) => (p._id === id ? { ...p, taken: true } : p)))

      toast({
        title: "Marked as taken",
        description: "The medication has been marked as taken for today.",
      })
    } catch (error) {
      console.error("Error marking prescription as taken:", error)
      toast({
        title: "Error",
        description: "Failed to update prescription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const snoozeReminder = async (id: string) => {
    try {
      // Add 10 minutes to the current time
      const now = new Date()
      now.setMinutes(now.getMinutes() + 10)

      const newReminderTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      const response = await fetch(`/api/prescriptions/${id}/snooze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newReminderTime }),
      })

      if (!response.ok) {
        throw new Error("Failed to snooze reminder")
      }

      // Refresh prescriptions to get updated data
      fetchPrescriptions()

      toast({
        title: "Reminder snoozed",
        description: "The reminder has been snoozed for 10 minutes.",
      })
    } catch (error) {
      console.error("Error snoozing reminder:", error)
      toast({
        title: "Error",
        description: "Failed to snooze reminder. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format time from 24-hour to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  // Calculate time remaining until reminder
  const getTimeRemaining = (reminderTime: string) => {
    const now = new Date()
    const [hours, minutes] = reminderTime.split(":").map(Number)

    const reminderDate = new Date()
    reminderDate.setHours(hours, minutes, 0, 0)

    // If the reminder time has already passed today, set it for tomorrow
    if (reminderDate < now) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }

    const diffMs = reminderDate.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHrs === 0 && diffMins === 0) {
      return "now"
    } else if (diffHrs === 0) {
      return `in ${diffMins}m`
    } else {
      return `in ${diffHrs}h ${diffMins}m`
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Include the ReminderService component to handle background checking */}
      <ReminderService />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Your Prescriptions</h1>
          <p className="text-muted-foreground">View and manage all your medication reminders</p>
        </div>

        {/* Upcoming Reminders Section */}
        {upcomingReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Reminders
                </CardTitle>
                <CardDescription>Your next medication reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div key={reminder._id} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                      <div className="flex items-center">
                        <Pill className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{reminder.medicineName}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-sm">{reminder.dosage}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {formatTime(reminder.reminderTime)}
                        </Badge>
                        <Badge variant="secondary">{getTimeRemaining(reminder.reminderTime)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : prescriptions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No prescriptions found</CardTitle>
              <CardDescription>You haven't added any prescriptions yet.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => (window.location.href = "/input")}>Add Your First Prescription</Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {prescriptions.map((prescription, index) => (
              <motion.div
                key={prescription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Pill className="h-5 w-5 mr-2 text-primary" />
                          {prescription.medicineName}
                        </CardTitle>
                        <CardDescription>Dosage: {prescription.dosage}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePrescription(prescription._id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Reminder set for {formatTime(prescription.reminderTime)}</span>
                      <Bell className="h-4 w-4 ml-4 mr-2 text-primary" />
                      <span>Voice reminder active</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => snoozeReminder(prescription._id)}
                      className="h-8"
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Snooze 10m
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => markAsTaken(prescription._id)}
                      className="h-8"
                      disabled={prescription.taken}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {prescription.taken ? "Taken" : "Mark as Taken"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      <Toaster />
    </div>
  )
}
