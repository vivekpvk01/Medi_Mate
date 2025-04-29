import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Prescription from "@/models/Prescription"

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get all prescriptions
    const prescriptions = await Prescription.find({})

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}
