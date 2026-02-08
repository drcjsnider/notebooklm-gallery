import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Share2, Search, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    link: "",
    tags: "",
    agreedToLegal: false,
  });

  const submitNotebook = trpc.notebooks.submit.useMutation({
    onSuccess: () => {
      toast.success("Notebook submitted successfully!");
      setFormData({ name: "", description: "", link: "", tags: "", agreedToLegal: false });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit notebook");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a notebook name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (formData.description.length > 250) {
      toast.error("Description must be 250 characters or less");
      return;
    }

    if (!formData.link.trim()) {
      toast.error("Please enter a notebook link");
      return;
    }

    if (!formData.agreedToLegal) {
      toast.error("You must agree to the legal disclaimer");
      return;
    }

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    submitNotebook.mutate({
      name: formData.name,
      description: formData.description,
      link: formData.link,
      tags: tagsArray,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">NotebookLM Gallery</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <Button variant="outline" size="sm">
                {user?.name || "User"}
              </Button>
            ) : (
              <Button size="sm" asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="space-y-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Discover Knowledge, Share Insights
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A community-curated collection of shared NotebookLM notebooks. Discover deep dives, audio overviews, and
              structured insights from creators around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2" asChild>
                <a href="/gallery">
                  <Search className="h-5 w-5" />
                  Explore Gallery
                </a>
              </Button>
              {isAuthenticated && (
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="#submit">
                    <Share2 className="h-5 w-5" />
                    Share Your Notebook
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Submission Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Notebook</CardTitle>
                  <CardDescription>
                    Share your NotebookLM creation with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Please sign in to submit your notebook
                      </p>
                      <Button asChild>
                        <a href={getLoginUrl()}>Sign In to Submit</a>
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Notebook Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., AI Ethics Deep Dive"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={submitNotebook.isPending}
                        />
                      </div>

                      {/* Description Field */}
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description ({formData.description.length}/250) *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your notebook in up to 250 characters..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value.slice(0, 250),
                            })
                          }
                          disabled={submitNotebook.isPending}
                          rows={4}
                        />
                      </div>

                      {/* Link Field */}
                      <div className="space-y-2">
                        <Label htmlFor="link">Notebook Link *</Label>
                        <Input
                          id="link"
                          type="url"
                          placeholder="https://notebooklm.google.com/..."
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          disabled={submitNotebook.isPending}
                        />
                      </div>

                      {/* Tags Field */}
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          placeholder="e.g., AI, Ethics, Research (comma-separated)"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          disabled={submitNotebook.isPending}
                        />
                      </div>

                      {/* Legal Disclaimer */}
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">Legal Notice</p>
                        <p className="text-sm text-muted-foreground">
                          By submitting, you confirm that your notebook only includes materials you are legally
                          allowed to use and share.
                        </p>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="legal"
                            checked={formData.agreedToLegal}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, agreedToLegal: checked as boolean })
                            }
                            disabled={submitNotebook.isPending}
                          />
                          <Label
                            htmlFor="legal"
                            className="text-sm cursor-pointer font-normal leading-relaxed"
                          >
                            I agree that I have the legal rights to share this content
                          </Label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={submitNotebook.isPending}
                      >
                        {submitNotebook.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {submitNotebook.isPending ? "Submitting..." : "Submit Notebook"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Share?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Build Community:</strong> Connect with researchers and
                    learners worldwide.
                  </p>
                  <p>
                    <strong className="text-foreground">Showcase Work:</strong> Highlight your research and insights.
                  </p>
                  <p>
                    <strong className="text-foreground">Inspire Others:</strong> Share knowledge and spark
                    collaboration.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Valid NotebookLM link</p>
                  <p>✓ Clear description</p>
                  <p>✓ Legal rights confirmed</p>
                  <p>✓ Optional tags for discovery</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
