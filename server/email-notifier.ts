import { notifyOwner } from "./_core/notification";

export async function notifyNewNotebook(
  notebookName: string,
  submitterName: string,
  notebookLink: string,
  description: string
): Promise<boolean> {
  const title = "New Notebook Submitted";
  const content = `
A new notebook has been submitted to your gallery:

**Notebook:** ${notebookName}
**Submitted by:** ${submitterName}
**Link:** ${notebookLink}
**Description:** ${description}

Please review and moderate as needed.
  `.trim();

  return await notifyOwner({ title, content });
}

export async function notifyNewReport(
  notebookName: string,
  reason: string,
  reportCount: number
): Promise<boolean> {
  const title = "Notebook Report Submitted";
  const content = `
A report has been filed for a notebook in your gallery:

**Notebook:** ${notebookName}
**Report Reason:** ${reason}
**Total Reports:** ${reportCount}

Please review this notebook and take appropriate action if needed.
  `.trim();

  return await notifyOwner({ title, content });
}
