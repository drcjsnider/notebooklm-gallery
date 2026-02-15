import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Search, ExternalLink, Flag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ReportDialog } from "@/components/ReportDialog";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [reportingNotebookId, setReportingNotebookId] = useState<number | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<any | null>(null);

  // Fetch all notebooks
  const { data: notebooks = [], isLoading } = trpc.notebooks.list.useQuery();

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notebooks.forEach((nb) => {
      if (Array.isArray(nb.tags)) {
        nb.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [notebooks]);

  // Filter notebooks based on search and selected tag
  const filteredNotebooks = useMemo(() => {
    return notebooks.filter((nb) => {
      const matchesSearch =
        searchQuery === "" ||
        nb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (nb.enhancedDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesTag = selectedTag === null || (Array.isArray(nb.tags) && nb.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [notebooks, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">NotebookLM Gallery</h1>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/">← Back to Submit</a>
          </Button>
        </div>
      </nav>

      {/* Search and Filter Section */}
      <section className="border-b border-border bg-card py-8">
        <div className="container max-w-6xl">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search notebooks by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Filter by Tag:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                  >
                    All Tags
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredNotebooks.length} notebook${filteredNotebooks.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNotebooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notebooks found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedTag
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to share a notebook!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onReport={() => setReportingNotebookId(notebook.id)}
                  onViewDetails={() => setSelectedNotebook(notebook)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Report Dialog */}
      {reportingNotebookId && (
        <ReportDialog
          notebookId={reportingNotebookId}
          onClose={() => setReportingNotebookId(null)}
        />
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedNotebook} onOpenChange={(open) => !open && setSelectedNotebook(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedNotebook && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNotebook.name}</DialogTitle>
              </DialogHeader>

              {/* OG Image */}
              {selectedNotebook.ogImage && (
                <div className="relative h-64 bg-muted overflow-hidden rounded-lg">
                  <img
                    src={selectedNotebook.ogImage}
                    alt={selectedNotebook.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                {/* Tags */}
                {Array.isArray(selectedNotebook.tags) && selectedNotebook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedNotebook.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNotebook.description}</p>
                </div>

                {/* Enhanced Description */}
                {selectedNotebook.enhancedDescription && (
                  <div>
                    <h3 className="font-semibold mb-2">Enhanced Summary</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNotebook.enhancedDescription}</p>
                  </div>
                )}

                {/* Link */}
                {selectedNotebook.link && (
                  <div>
                    <Button asChild className="w-full">
                      <a href={selectedNotebook.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Notebook
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NotebookCardProps {
  notebook: any;
  onReport: () => void;
  onViewDetails: () => void;
}

function NotebookCard({ notebook, onReport, onViewDetails }: NotebookCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewDetails}>
      {/* OG Image */}
      {notebook.ogImage && (
        <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
          <img
            src={notebook.ogImage}
            alt={notebook.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2">{notebook.name}</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onReport();
                }}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Report problems with this site</TooltipContent>
          </Tooltip>
        </div>
        <CardDescription className="line-clamp-3">
          {notebook.enhancedDescription || notebook.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        {Array.isArray(notebook.tags) && notebook.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {notebook.tags.slice(0, 4).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {notebook.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{notebook.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Link Button */}
        <Button
          asChild
          className="w-full gap-2"
          variant="default"
          onClick={(e) => e.stopPropagation()}
        >
          <a href={notebook.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open Notebook
          </a>
        </Button>
      </CardContent>

      {/* Metadata */}
      <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
        <p>
          Submitted {new Date(notebook.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}
