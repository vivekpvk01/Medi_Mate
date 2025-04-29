import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Prescription from "@/models/Prescription"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { newReminderTime } = await request.json()

    // Connect to the database
    await connectToDatabase()

    // Find the prescription
    const prescription = await Prescription.findById(id)

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    }

    // Update the reminder time
    prescription.reminderTime = newReminderTime
    await prescription.save()

    return NextResponse.json(
      {
        message: "Reminder snoozed successfully",
        prescription,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error snoozing reminder:", error)
    return NextResponse.json({ error: "Failed to snooze reminder" }, { status: 500 })
  }
}
