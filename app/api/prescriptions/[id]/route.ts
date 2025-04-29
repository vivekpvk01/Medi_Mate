import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Prescription from "@/models/Prescription"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to the database
    await connectToDatabase()

    // Find and delete the prescription
    const deletedPrescription = await Prescription.findByIdAndDelete(id)

    if (!deletedPrescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Prescription deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting prescription:", error)
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 })
  }
}
