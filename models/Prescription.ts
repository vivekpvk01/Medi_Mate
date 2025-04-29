import mongoose, { Schema, type Document } from "mongoose"

export interface IPrescription extends Document {
  medicineName: string
  dosage: string
  reminderTime: string
  createdAt: Date
  taken?: boolean
}

const PrescriptionSchema: Schema = new Schema({
  medicineName: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  reminderTime: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  taken: {
    type: Boolean,
    default: false,
  },
})

// Check if the model already exists to prevent overwriting
export default mongoose.models.Prescription || mongoose.model<IPrescription>("Prescription", PrescriptionSchema)
