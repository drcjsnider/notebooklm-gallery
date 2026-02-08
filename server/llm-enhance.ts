import { invokeLLM } from "./_core/llm";

export interface EnhancementResult {
  enhancedDescription: string;
  suggestedTags: string[];
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string | unknown;
    };
  }>;
}

export async function enhanceNotebookContent(
  name: string,
  description: string,
  ogMetadata: Record<string, unknown> | null
): Promise<EnhancementResult> {
  try {
    const ogInfo = ogMetadata
      ? `OG Title: ${ogMetadata.title || "N/A"}\nOG Description: ${ogMetadata.description || "N/A"}\nOG Type: ${ogMetadata.type || "N/A"}`
      : "No OG metadata available";

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing research notebooks and generating insightful descriptions. You help improve notebook descriptions and suggest relevant tags for discovery. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Please analyze this NotebookLM notebook and provide an enhanced description and relevant tags.

Notebook Name: ${name}
User Description: ${description}

${ogInfo}

Provide your response as JSON with exactly this structure:
{
  "enhancedDescription": "A more detailed and engaging description (2-3 sentences)",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Focus on:
- Making the description more compelling and informative
- Suggesting tags that help with discoverability
- Keeping tags relevant to research, knowledge, and learning`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "notebook_enhancement",
          strict: true,
          schema: {
            type: "object",
            properties: {
              enhancedDescription: {
                type: "string",
                description: "Enhanced description of the notebook",
              },
              suggestedTags: {
                type: "array",
                items: { type: "string" },
                description: "Suggested tags for the notebook",
              },
            },
            required: ["enhancedDescription", "suggestedTags"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message.content;
    if (!messageContent) {
      throw new Error("No response from LLM");
    }

    const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
    const parsed = JSON.parse(content);
    return {
      enhancedDescription: parsed.enhancedDescription || description,
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
    };
  } catch (error) {
    console.error("Failed to enhance notebook content:", error);
    // Return original values if enhancement fails
    return {
      enhancedDescription: description,
      suggestedTags: [],
    };
  }
}
