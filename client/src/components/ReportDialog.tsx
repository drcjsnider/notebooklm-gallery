import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReportDialogProps {
  notebookId: number;
  onClose: () => void;
}

export function ReportDialog({ notebookId, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState("");

  const reportMutation = trpc.notebooks.report.useMutation({
    onSuccess: () => {
      toast.success("Report submitted successfully. Thank you for helping keep the community safe.");
      setReason("");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please provide a reason for your report");
      return;
    }

    if (reason.length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }

    reportMutation.mutate({
      notebookId,
      reason,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Notebook</DialogTitle>
          <DialogDescription>
            Help us maintain a safe and respectful community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report *</Label>
            <Textarea
              id="reason"
              placeholder="Please describe why you're reporting this notebook..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={reportMutation.isPending}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length} characters
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reportMutation.isPending}
              className="gap-2"
            >
              {reportMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
