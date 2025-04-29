import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Prescription from "@/models/Prescription"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to the database
    await connectToDatabase()

    // Find the prescription
    const prescription = await Prescription.findById(id)

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    }

    // Mark as taken (in a real app, you might want to store this in a separate collection)
    prescription.taken = true
    await prescription.save()

    return NextResponse.json({ message: "Prescription marked as taken" }, { status: 200 })
  } catch (error) {
    console.error("Error marking prescription as taken:", error)
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
  }
}
