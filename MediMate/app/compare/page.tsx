"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, DollarSign, ArrowUpDown, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock data for pharmacy prices
const pharmacies = [
  "MedPlus",
  "HealthMart",
  "CarePharm",
  "WellLife",
  "MediStore",
  "PharmaWorld",
  "LifeCare",
  "HealthPoint",
  "MedExpress",
  "VitalRx",
  "CurePlus",
  "WellnessRx",
  "MediCare",
  "HealthHub",
  "PharmaPlus",
  "QuickMeds",
  "SaveRx",
  "ValuePharm",
  "MedValue",
  "DiscountRx",
  "PrimeCare",
  "FastMeds",
  "BudgetPharm",
  "EconoMeds",
  "ThriftyRx",
  "MedSaver",
  "BargainMeds",
  "SmartRx",
  "EconomyPharm",
  "AffordableCare",
]

interface MedicinePrice {
  pharmacy: string
  price: number
  inStock: boolean
}

interface Medicine {
  id: string
  name: string
  prices: MedicinePrice[]
}

// Generate random prices for a medicine
const generatePrices = (medicineName: string): MedicinePrice[] => {
  // Use the medicine name as a seed for consistent random prices
  const seed = medicineName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return pharmacies.map((pharmacy) => {
    // Generate a pseudo-random price between $5 and $50
    const randomFactor = ((seed * pharmacy.length) % 100) / 100
    const price = 5 + Math.floor(randomFactor * 45 * 100) / 100

    // 90% chance of being in stock
    const inStock = Math.random() > 0.1

    return {
      pharmacy,
      price,
      inStock,
    }
  })
}

// Common medicines for autocomplete
const commonMedicines = [
  "Aspirin",
  "Ibuprofen",
  "Paracetamol",
  "Amoxicillin",
  "Lisinopril",
  "Atorvastatin",
  "Metformin",
  "Amlodipine",
  "Omeprazole",
  "Simvastatin",
]

export default function ComparePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" }>({
    key: "price",
    direction: "ascending",
  })

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = commonMedicines.filter((med) => med.toLowerCase().includes(searchTerm.toLowerCase()))
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [searchTerm])

  const handleSearch = () => {
    if (searchTerm.trim() === "") return

    const medicine: Medicine = {
      id: Date.now().toString(),
      name: searchTerm,
      prices: generatePrices(searchTerm),
    }

    setSelectedMedicine(medicine)
    setSuggestions([])
  }

  const handleSuggestionClick = (medicine: string) => {
    setSearchTerm(medicine)
    setSuggestions([])

    const medicineData: Medicine = {
      id: Date.now().toString(),
      name: medicine,
      prices: generatePrices(medicine),
    }

    setSelectedMedicine(medicineData)
  }

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  const sortedPrices = selectedMedicine?.prices.slice().sort((a, b) => {
    if (sortConfig.key === "pharmacy") {
      return sortConfig.direction === "ascending"
        ? a.pharmacy.localeCompare(b.pharmacy)
        : b.pharmacy.localeCompare(a.pharmacy)
    } else if (sortConfig.key === "price") {
      return sortConfig.direction === "ascending" ? a.price - b.price : b.price - a.price
    }
    return 0
  })

  const lowestPrice = selectedMedicine?.prices.reduce(
    (min, p) => (p.price < min && p.inStock ? p.price : min),
    Number.MAX_VALUE,
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Medicine Price Comparison</h1>
          <p className="text-muted-foreground">Compare prices across 30+ pharmacies to find the best deals</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Medicine</CardTitle>
            <CardDescription>Enter a medicine name to compare prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter medicine name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    {suggestions.map((medicine) => (
                      <div
                        key={medicine}
                        className="px-4 py-2 cursor-pointer hover:bg-muted"
                        onClick={() => handleSuggestionClick(medicine)}
                      >
                        {medicine}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Compare
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedMedicine && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Price Comparison for {selectedMedicine.name}</CardTitle>
                <CardDescription>Comparing prices across {pharmacies.length} pharmacies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("pharmacy")}
                            className="flex items-center p-0 h-auto font-medium"
                          >
                            Pharmacy
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("price")}
                            className="flex items-center p-0 h-auto font-medium"
                          >
                            Price
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPrices?.map((price) => (
                        <TableRow key={price.pharmacy}>
                          <TableCell className="font-medium">{price.pharmacy}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className={price.price === lowestPrice ? "font-bold text-primary" : ""}>
                                {price.price.toFixed(2)}
                              </span>
                              {price.price === lowestPrice && (
                                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                                  Best Price
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {price.inStock ? (
                              <span className="inline-flex items-center text-green-600">
                                <Check className="h-4 w-4 mr-1" />
                                In Stock
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Out of Stock</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
