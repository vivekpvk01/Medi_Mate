"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Pill } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Prescription {
  _id: string
  medicineName: string
  dosage: string
  reminderTime: string
}

export default function UpcomingReminders() {
  const [upcomingReminders, setUpcomingReminders] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReminders()

    // Refresh reminders every minute
    const intervalId = setInterval(fetchReminders, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/getReminders")

      if (!response.ok) {
        throw new Error("Failed to fetch reminders")
      }

      const reminders: Prescription[] = await response.json()

      // Calculate upcoming reminders
      calculateUpcomingReminders(reminders)
    } catch (error) {
      console.error("Error fetching reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateUpcomingReminders = (reminders: Prescription[]) => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Convert current time to minutes since midnight for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Map reminders to include time in minutes and filter out past reminders for today
    const reminderTimes = reminders.map((reminder) => {
      const [hours, minutes] = reminder.reminderTime.split(":").map(Number)
      const timeInMinutes = hours * 60 + minutes

      return {
        ...reminder,
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

  if (upcomingReminders.length === 0 && !loading) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" />
            Upcoming Reminders
          </CardTitle>
          <CardDescription>Your next medication reminders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
