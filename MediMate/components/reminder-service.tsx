"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface Prescription {
  _id: string
  medicineName: string
  dosage: string
  reminderTime: string
}

export default function ReminderService() {
  const [lastCheckedMinute, setLastCheckedMinute] = useState<number>(-1)
  const [nextReminders, setNextReminders] = useState<{ medicineName: string; reminderTime: string }[]>([])

  // Function to check if reminders should be triggered
  const checkReminders = async () => {
    try {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Only check once per minute to avoid duplicate notifications
      if (currentMinute === lastCheckedMinute) {
        return
      }

      setLastCheckedMinute(currentMinute)

      // Format current time to match the format stored in the database (HH:MM)
      const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

      // Fetch reminders from the API
      const response = await fetch("/api/getReminders")

      if (!response.ok) {
        throw new Error("Failed to fetch reminders")
      }

      const reminders: Prescription[] = await response.json()

      // Check if any reminder matches the current time
      const matchingReminders = reminders.filter((reminder) => reminder.reminderTime === currentTime)

      // Trigger voice alerts for matching reminders
      matchingReminders.forEach((reminder) => {
        triggerVoiceAlert(reminder.medicineName, reminder.dosage)

        // Also show a toast notification
        toast({
          title: "Medication Reminder",
          description: `Time to take ${reminder.medicineName} - ${reminder.dosage}`,
        })
      })

      // Calculate and set next upcoming reminders
      calculateNextReminders(reminders)
    } catch (error) {
      console.error("Error checking reminders:", error)
    }
  }

  // Function to trigger voice alert
  const triggerVoiceAlert = (medicineName: string, dosage: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }

    const utterance = new SpeechSynthesisUtterance(`Please take your ${medicineName} now. Dosage: ${dosage}`)

    utterance.rate = 0.9 // Slightly slower rate for clarity
    utterance.volume = 1.0 // Maximum volume

    window.speechSynthesis.speak(utterance)
  }

  // Function to calculate next upcoming reminders
  const calculateNextReminders = (reminders: Prescription[]) => {
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
        medicineName: reminder.medicineName,
        reminderTime: reminder.reminderTime,
        timeInMinutes: timeInMinutes,
        // If the reminder time has passed for today, add 24 hours (1440 minutes)
        adjustedTimeInMinutes: timeInMinutes <= currentTimeInMinutes ? timeInMinutes + 1440 : timeInMinutes,
      }
    })

    // Sort by adjusted time to get the next upcoming reminders
    const sortedReminders = reminderTimes.sort((a, b) => a.adjustedTimeInMinutes - b.adjustedTimeInMinutes)

    // Take the next 3 upcoming reminders
    setNextReminders(
      sortedReminders.slice(0, 3).map((r) => ({
        medicineName: r.medicineName,
        reminderTime: r.reminderTime,
      })),
    )
  }

  useEffect(() => {
    // Check reminders immediately when component mounts
    checkReminders()

    // Set up interval to check reminders every minute
    const intervalId = setInterval(checkReminders, 60000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [lastCheckedMinute])

  // This component doesn't render anything visible
  return null
}
