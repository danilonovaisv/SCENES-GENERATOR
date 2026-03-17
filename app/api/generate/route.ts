import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const pieceType = formData.get("pieceType") as string;
    const artDirection = formData.get("artDirection") as string;
    const sceneType = formData.get("sceneType") as string;
    const characters = formData.get("characters") as string;
    const additionalDescription = formData.get("additionalDescription") as string;

    if (!file || !pieceType || !artDirection || !sceneType || !characters) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    const generateShot = async (shotType: string) => {
      let shotPrompt = "";
      const baseContext = `Art Direction: ${artDirection}. Scene Setting: ${sceneType}. Characters present: ${characters}. ${additionalDescription ? `Additional details: ${additionalDescription}` : ''}`;

      if (shotType === "wide") {
        shotPrompt = `Create a realistic wide shot of the following scene: ${baseContext}. The environment should be vast and clearly visible. In the scene, seamlessly integrate a ${pieceType} that displays the provided image exactly as it is. DO NOT alter the provided image's content, treat it as a fixed texture on the ${pieceType}.`;
      } else if (shotType === "medium") {
        shotPrompt = `Create a realistic medium shot at eye level of the following scene: ${baseContext}. Show human interaction or immediate context around a ${pieceType} that displays the provided image exactly as it is. DO NOT alter the provided image's content.`;
      } else {
        shotPrompt = `Create a realistic, dramatic close-up shot of the following scene: ${baseContext}, focusing heavily on the ${pieceType}. The provided image must be displayed exactly as it is, ensuring all logos and texts from the original art are sharp, legible, and undistorted. DO NOT alter the provided image's content.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: shotPrompt },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error(`Failed to generate ${shotType} shot`);
    };

    // Generate the 3 shots in parallel
    const [wide, medium, closeup] = await Promise.all([
      generateShot("wide"),
      generateShot("medium"),
      generateShot("closeup")
    ]);

    return NextResponse.json({ wide, medium, closeup });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate scenes" }, { status: 500 });
  }
}
