"use client"

import type React from "react"

import { useState } from "react"
import {useNavigate}  from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, GitBranch } from "lucide-react"
import {Link} from "react-router"
import MainLayout from "@/main-layout"
import { useCreatePipeline } from "@/hooks/usePipeline"

interface PipelineFormData {
  name: string
  description: string
}

export default function CreatePipelinePage() {
  const navigate = useNavigate()
  const { createPipeline, isLoading, error } = useCreatePipeline()
  const [formData, setFormData] = useState<PipelineFormData>({
    name: "",
    description: "",
  })

  const handleInputChange =
    (field: keyof PipelineFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleCancel = () => {
    navigate("/dashboard")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    try {
      // Create pipeline via hook
      await createPipeline({
        name: formData.name.trim(),
        description: formData.description.trim() || formData.name.trim()
      })

      // Hook will handle redirect automatically
    } catch (error) {
      // Error is handled by the hook
      console.error("Error creating pipeline:", error)
    }
  }

  const isFormValid = formData.name.trim().length > 0

  return (
  <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link
          to="/pipeline"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back To Pipeline</span>
        </Link>
      </div>

      {/* Main Content Card */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="space-y-6 pb-8">
          {/* Icon */}
          <div className="flex justify-start">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold text-foreground capitalize">buat Pipeline baru</CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Buat pipeline baru untuk mengelola proses bisnis Anda. Berikan nama dan deskripsi yang sesuai untuk
              memulai.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Pipeline Name Field */}
            <div className="space-y-2">
              <Label htmlFor="pipelineName" className="text-sm font-medium text-foreground">
                Pipeline Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pipelineName"
                type="text"
                placeholder="Nama pipeline Anda"
                value={formData.name}
                onChange={handleInputChange("name")}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tentang pipeline ini"
                value={formData.description}
                onChange={handleInputChange("description")}
                className="w-full min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none sm:px-8"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1 sm:flex-none sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pipeline
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {/* <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
        <h3 className="font-medium text-foreground mb-2">What happens next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• You'll be able to add stages to your pipeline</li>
          <li>• Configure automation rules and triggers</li>
          <li>• Assign team members and set permissions</li>
          <li>• Start tracking your business processes</li>
        </ul>
      </div> */}
    </div>
  </MainLayout>
  )
}
