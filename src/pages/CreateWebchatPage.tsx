import React, { useState } from 'react'
import MainLayout from '@/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Upload } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
}

interface SocialLink {
  id: string
  platform: string
  url: string
}

const CreateWebchatPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([{ id: '1', question: '', answer: '' }])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ id: '1', platform: '', url: '' }])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const addFaq = () => {
    const newFaq: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    }
    setFaqs([...faqs, newFaq])
  }

  const removeFaq = (id: string) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter(faq => faq.id !== id))
    }
  }

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: '',
      url: ''
    }
    setSocialLinks([...socialLinks, newLink])
  }

  const removeSocialLink = (id: string) => {
    if (socialLinks.length > 1) {
      setSocialLinks(socialLinks.filter(link => link.id !== id))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(files)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Webchat</CardTitle>
            <CardDescription>
              Set up your webchat configuration with agents, FAQs, and social links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" name="name" placeholder="Enter webchat name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input type="text" id="description" name="description" placeholder="Enter description" />
                </div>
              </div>

              {/* Division and Agents Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="division">Select Division</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agents">Select Agents</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent1">Agent 1</SelectItem>
                      <SelectItem value="agent2">Agent 2</SelectItem>
                      <SelectItem value="agent3">Agent 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">FAQ</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                {faqs.map((faq, index) => (
                  <div key={faq.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Question {index + 1}</Label>
                      {faqs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(faq.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Enter question"
                      value={faq.question}
                      onChange={(e) => {
                        const updatedFaqs = faqs.map(f => 
                          f.id === faq.id ? { ...f, question: e.target.value } : f
                        )
                        setFaqs(updatedFaqs)
                      }}
                    />
                    <Textarea
                      placeholder="Enter answer"
                      value={faq.answer}
                      onChange={(e) => {
                        const updatedFaqs = faqs.map(f => 
                          f.id === faq.id ? { ...f, answer: e.target.value } : f
                        )
                        setFaqs(updatedFaqs)
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Social Links Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Social Links</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                {socialLinks.map((link, index) => (
                  <div key={link.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Link {index + 1}</Label>
                      {socialLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSocialLink(link.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select
                        value={link.platform}
                        onValueChange={(value) => {
                          const updatedLinks = socialLinks.map(l => 
                            l.id === link.id ? { ...l, platform: value } : l
                          )
                          setSocialLinks(updatedLinks)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Enter URL"
                        value={link.url}
                        onChange={(e) => {
                          const updatedLinks = socialLinks.map(l => 
                            l.id === link.id ? { ...l, url: e.target.value } : l
                          )
                          setSocialLinks(updatedLinks)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Upload Files</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-center text-primary hover:text-primary/80">
                          Click to upload files
                        </span>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Webchat
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default CreateWebchatPage