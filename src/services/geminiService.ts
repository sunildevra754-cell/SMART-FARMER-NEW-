import { GoogleGenAI, GenerateContentResponse, Modality, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

function addWavHeader(base64Pcm: string, sampleRate: number = 24000): string {
  const binaryString = window.atob(base64Pcm);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + bytes.length, true); // ChunkSize
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, bytes.length, true); // Subchunk2Size

  const combined = new Uint8Array(wavHeader.byteLength + bytes.length);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(bytes, wavHeader.byteLength);

  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return window.btoa(binary);
}

export async function generateSpeech(text: string, retryCount = 0): Promise<string | null> {
  const model = "gemini-2.5-flash-preview-tts";
  // Truncate text to avoid 500 errors on extremely long inputs
  const truncatedText = text.length > 1000 ? text.substring(0, 1000) + "..." : text;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Say clearly: ${truncatedText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
      const { data, mimeType } = part.inlineData;
      
      if (mimeType.includes('pcm')) {
        const wavBase64 = addWavHeader(data, 24000);
        return `data:audio/wav;base64,${wavBase64}`;
      }
      
      return `data:${mimeType};base64,${data}`;
    }
    return null;
  } catch (error) {
    console.error(`Error in generateSpeech (attempt ${retryCount + 1}):`, error);
    
    // Simple retry logic for 500 errors
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateSpeech(truncatedText, retryCount + 1);
    }
    
    return null;
  }
}

export async function transcribeAudio(audioBase64: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
          { text: "Transcribe this audio accurately. Only return the transcription." },
        ],
      }],
    });

    return response.text || "";
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw error;
  }
}

export async function generateImage(prompt: string, aspectRatio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9" = "1:1") {
  const model = "gemini-3-pro-image-preview";
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function getWeatherInfo(lat: number, lon: number) {
  const model = "gemini-3-flash-preview";
  const prompt = `Get current weather and 5-day forecast for coordinates: ${lat}, ${lon}. 
  Provide the following in JSON format: 
  {
    "location": "City, State",
    "current": {
      "temp": number,
      "condition": "string",
      "windSpeed": number,
      "humidity": number,
      "precipitation": number,
      "uvIndex": "string"
    },
    "forecast": [
      { "day": "string", "temp": number, "condition": "string" }
    ],
    "advisory": "string",
    "shouldSpray": boolean,
    "sprayReason": "string",
    "cropAdvice": {
      "recommendedCrops": ["string"],
      "waterRequirement": "string",
      "fertilizerAdvice": "string",
      "manureAdvice": "string"
    }
  }
  The spray advisory should be based on: 
  - Wind speed < 15 km/h
  - No rain expected in next 6 hours
  - Humidity < 85%
  
  The cropAdvice should be specific to the current season and weather in that location.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

export async function detectCropDisease(imageBase64: string, mimeType: string, userPrompt?: string) {
  const model = "gemini-3.1-pro-preview";
  const prompt = `Analyze this image. ${userPrompt ? `The user also said: "${userPrompt}". ` : ''}
  1. FIRST, determine if this image contains a plant, crop, or agricultural field. 
  2. If it is NOT a crop or plant, respond with "NOT_A_CROP: This image does not appear to be a crop or plant. Please upload a clear picture of your crop for analysis. If this is a crop, try taking the photo from a different angle or in better light."
  3. If it IS a crop:
     - Identify the crop name.
     - Identify if there is any disease or pest infestation.
     - If a disease is found, provide:
        - Name of the disease.
        - Symptoms observed.
        - Actionable solution (pesticides, organic treatments, or cultural practices).
        - Prevention tips for the future.
     - If the crop is healthy, confirm it and give general health tips.
  
  Please be very specific and provide a clear solution. Use a helpful tone for a farmer.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
  });

  return response.text;
}

export async function getAIAdvice(query: string, context?: string) {
  const model = "gemini-3.1-pro-preview";
  const systemInstruction = `You are an expert agricultural advisor and Google AI Voice Assistant for the SMART FARMER app. 
  Provide practical, accurate, and actionable advice on farming, fertilizers, pest control, and market trends. 
  You can also assist users with the Marketplace (buying and selling crops), checking Mandi prices, and operating drones.
  Keep your answers concise and easy for farmers to understand. 
  If context is provided, use it to tailor your response.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: { systemInstruction },
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error in getAIAdvice:", error);
    throw error;
  }
}

export async function getComplexAdvice(query: string) {
  const model = "gemini-3.1-pro-preview";
  const systemInstruction = `You are a highly advanced agricultural scientist and Google AI Voice Assistant for the SMART FARMER app. 
  Solve complex farming problems with deep reasoning and scientific accuracy.
  You can also assist users with the Marketplace (buying and selling crops), checking Mandi prices, and operating drones.
  Provide clear, concise, and helpful responses.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: { 
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      },
    });

    return response.text || "I'm sorry, I couldn't generate a complex response.";
  } catch (error) {
    console.error("Error in getComplexAdvice:", error);
    throw error;
  }
}

export async function getProfitAnalysis(crop: string, area: number, budget: number) {
  const model = "gemini-3.1-flash-lite-preview";
  const prompt = `Analyze the potential profit for growing ${crop} on ${area} acres with a budget of ${budget} INR. 
  Include estimated yield, market price trends, and a breakdown of potential expenses and net profit. 
  Provide a clear action plan to maximize profit.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function findNearbyStores(query: string, lat: number, lng: number) {
  const model = "gemini-2.5-flash";
  const prompt = `Find nearby ${query}. Provide a helpful summary of the best options.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    },
  });

  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.maps) || []
  };
}
