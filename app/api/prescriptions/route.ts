import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Prescription from "@/models/Prescription"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { medicineName, dosage, reminderTime } = body

    // Validate required fields
    if (!medicineName || !dosage || !reminderTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Create a new prescription
    const prescription = new Prescription({
      medicineName,
      dosage,
      reminderTime,
    })

    // Save the prescription to the database
    await prescription.save()

    return NextResponse.json({ message: "Prescription saved successfully", prescription }, { status: 201 })
  } catch (error) {
    console.error("Error saving prescription:", error)
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get all prescriptions
    const prescriptions = await Prescription.find({}).sort({ createdAt: -1 })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 })
  }
}
