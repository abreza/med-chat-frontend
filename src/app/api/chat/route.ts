import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    const validMessages = messages.filter(
      (msg) => msg && msg.content && typeof msg.content === "string"
    );

    if (validMessages.length === 0) {
      return new Response("No valid messages provided", { status: 400 });
    }

    const result = await streamText({
      model: openrouter("gpt-4o"), // Using gpt-4o instead of gpt-4.1
      system:
        "You are a helpful medical assistant. Provide helpful and accurate information. You should speak in persian.",
      messages: validMessages,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        if (error == null) {
          return "Unknown error occurred";
        }
        if (typeof error === "string") {
          return error;
        }
        if (error instanceof Error) {
          return error.message;
        }
        return "An error occurred while processing your request";
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
