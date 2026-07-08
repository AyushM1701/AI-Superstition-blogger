const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'stage';
const BASE_URL = `https://api.shotstack.io/${SHOTSTACK_ENV}`;

export async function submitRender(script: string, audioUrl: string, imagePrompts: string[]): Promise<string> {
  if (!SHOTSTACK_API_KEY) {
    throw new Error('SHOTSTACK_API_KEY is missing');
  }

  // 1. Calculate duration
  const words = script.split(/\s+/).length;
  // Estimate ~150 words per minute (2.5 words per sec)
  const durationSeconds = Math.ceil(words / 2.5);
  
  if (durationSeconds > 40) {
    throw new Error(`Script exceeds 40-second limit. Estimated duration: ${durationSeconds}s`);
  }

  // Determine webhook URL
  const webhookUrl = process.env.WEBHOOK_URL || 'https://example.com/api/webhook';

  // 2. Build JSON payload
  const clipLength = Number((durationSeconds / imagePrompts.length).toFixed(2));
  const effects = ["zoomIn", "slideRight", "zoomOut", "slideLeft"];
  
  const imageClips = imagePrompts.map((prompt, index) => {
    const encodedPrompt = encodeURIComponent(prompt + ", cinematic, highly detailed, 8k, professional photography");
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    
    const clip: Record<string, unknown> = {
      asset: {
        type: "image",
        src: imageUrl
      },
      start: Number((index * clipLength).toFixed(2)),
      length: index === imagePrompts.length - 1 
        ? Number((durationSeconds - (index * clipLength)).toFixed(2)) 
        : clipLength,
      effect: effects[index % effects.length]
    };

    // Only add transition when fading is needed (Shotstack doesn't accept "none")
    const transition: Record<string, string> = {};
    if (index > 0) transition.in = "fade";
    if (index < imagePrompts.length - 1) transition.out = "fade";
    if (Object.keys(transition).length > 0) clip.transition = transition;

    return clip;
  });

  const payload = {
    timeline: {
      background: "#000000",
      tracks: [
        {
          clips: imageClips
        },
        {
          clips: [
            {
              asset: {
                type: "audio",
                src: audioUrl
              },
              start: 0,
              length: durationSeconds
            }
          ]
        }
      ]
    },
    output: {
      format: "mp4",
      resolution: "sd"
    },
    callback: webhookUrl
  };

  // 3. Submit request
  const response = await fetch(`${BASE_URL}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': SHOTSTACK_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shotstack API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.response.id;
}

export async function getRenderStatus(renderId: string): Promise<{ status: string, url?: string, error?: string }> {
  if (!SHOTSTACK_API_KEY) {
    throw new Error('SHOTSTACK_API_KEY is missing');
  }

  const response = await fetch(`${BASE_URL}/render/${renderId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'x-api-key': SHOTSTACK_API_KEY
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shotstack API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const status = data.response.status;
  const url = data.response.url;
  const error = data.response.error;

  return { status, url, error };
}
