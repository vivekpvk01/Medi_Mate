"use client"

import { useEffect, useState } from "react"
import { Bell, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface VoiceReminderProps {
  medicineName: string
  reminderTime: string
  onComplete?: () => void
}

export default function VoiceReminder({ medicineName, reminderTime, onComplete }: VoiceReminderProps) {
  const [isActive, setIsActive] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Check if speech synthesis is supported
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      toast({
        title: "Voice Reminder Error",
        description: "Your browser doesn't support voice reminders.",
        variant: "destructive",
      })
      return
    }

    // Calculate time until reminder
    const calculateTimeLeft = () => {
      const now = new Date()
      const [hours, minutes] = reminderTime.split(":").map(Number)

      const reminderDate = new Date()
      reminderDate.setHours(hours, minutes, 0, 0)

      // If the reminder time has already passed today, set it for tomorrow
      if (reminderDate < now) {
        reminderDate.setDate(reminderDate.getDate() + 1)
      }

      const difference = reminderDate.getTime() - now.getTime()

      if (difference <= 0) {
        // Time to trigger the reminder
        playVoiceReminder()
        return null
      }

      // Calculate hours and minutes left
      const hoursLeft = Math.floor(difference / (1000 * 60 * 60))
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      return `${hoursLeft}h ${minutesLeft}m`
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Set up interval to check time
    const intervalId = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft === null) {
        // Reminder has triggered
        if (onComplete) {
          onComplete()
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [medicineName, reminderTime, isActive, onComplete])

  const playVoiceReminder = () => {
    if (!("speechSynthesis" in window)) return

    const utterance = new SpeechSynthesisUtterance(
      `It's time to take your medicine ${medicineName}. Please don't forget to take your medication.`,
    )

    utterance.rate = 0.9 // Slightly slower rate for clarity
    utterance.pitch = 1.1 // Slightly higher pitch
    utterance.volume = 1.0 // Maximum volume

    speechSynthesis.speak(utterance)

    // Also show a toast notification
    toast({
      title: "Medicine Reminder",
      description: `It's time to take your ${medicineName}`,
    })
  }

  const toggleReminder = () => {
    setIsActive(!isActive)

    toast({
      title: isActive ? "Reminder Disabled" : "Reminder Enabled",
      description: isActive
        ? `Voice reminder for ${medicineName} has been disabled.`
        : `Voice reminder for ${medicineName} has been enabled.`,
    })
  }

  const testReminder = () => {
    playVoiceReminder()
  }

  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
      <div className="flex items-center">
        <Bell className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm">
          {isActive ? `Reminder active${timeLeft ? ` (${timeLeft} left)` : ""}` : "Reminder disabled"}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={testReminder} className="h-8 px-2">
          Test
        </Button>
        <Button variant={isActive ? "default" : "ghost"} size="sm" onClick={toggleReminder} className="h-8 w-8 p-0">
          {isActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="sr-only">{isActive ? "Disable" : "Enable"} reminder</span>
        </Button>
      </div>
    </div>
  )
}
