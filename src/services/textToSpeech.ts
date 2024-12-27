interface GoogleTTSResponse {
  audioContent: string;
}

export const textToSpeech = async (text: string): Promise<void> => {
  try {
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_TTS_API_KEY}`
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Standard-A'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: 0,
          speakingRate: 1
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha na síntese de voz');
    }

    const data: GoogleTTSResponse = await response.json();
    const audioContent = data.audioContent;
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    await audio.play();
  } catch (error) {
    console.error('Erro na síntese de voz:', error);
    // Fallback para a API nativa do navegador
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  }
};