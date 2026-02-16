
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generatePostContent = async (topic: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a catchy, engaging social media post about: "${topic}". Keep it under 280 characters and include relevant hashtags.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text || "Could not generate content at this time.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating post content.";
  }
};

export const generatePostImage = async (prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A vibrant, high-quality social media photography style image of: ${prompt}. Cinematic lighting, 4k.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    return null;
  }
};

export const generateSearchThumbnails = async (query: string): Promise<string[]> => {
  const ai = getAIClient();
  try {
    // Generate 3 thumbnails in parallel for diversity
    const prompts = [
      `A clean, minimalist thumbnail representing ${query}, cinematic style.`,
      `A detailed close-up conceptual photography related to ${query}.`,
      `An artistic, modern digital illustration of ${query}.`
    ];

    const tasks = prompts.map(prompt => 
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      })
    );

    const results = await Promise.all(tasks);
    const images: string[] = [];

    for (const response of results) {
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          images.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    }
    return images;
  } catch (error) {
    console.error("Thumbnail Generation Error:", error);
    return [];
  }
};

export const generateUserBio = async (interests: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a professional and witty social media bio based on these interests: ${interests}. Keep it short and punchy.`,
    });
    return response.text?.trim() || "Passionate creator exploring the digital ether.";
  } catch (error) {
    console.error("Bio Generation Error:", error);
    return "Exploring the world one pixel at a time.";
  }
};

export const speakText = async (text: string): Promise<Uint8Array | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this social media post naturally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return decode(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const searchGrounding = async (query: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text,
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web) || []
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return null;
  }
};

// Audio helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
