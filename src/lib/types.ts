export type NotebookStatus = "approved" | "removed" | "rejected";

export type Notebook = {
  id: string;
  notebookName: string;
  description: string;
  link: string;
  tags: string[];
  submitterEmail: string | null;
  ogImageUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  status: NotebookStatus;
  legalConfirmed: boolean;
  createdAt: string;
};

export type SubmissionPayload = {
  notebookName: string;
  description: string;
  link: string;
  tags: string;
  submitterEmail: string;
  legalConfirmed: boolean;
};

export type SubmissionErrors = Partial<
  Record<
    | "notebookName"
    | "description"
    | "link"
    | "tags"
    | "submitterEmail"
    | "legalConfirmed",
    string
  >
>;

export type SubmissionResponse = {
  success: boolean;
  message?: string;
  errors?: SubmissionErrors;
};

export type ReportResponse = {
  success: boolean;
  message?: string;
  errors?: {
    reason?: string;
  };
};
