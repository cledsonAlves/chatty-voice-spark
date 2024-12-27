export const textToSpeech = async (text: string): Promise<void> => {
  // Esta é uma implementação temporária usando a API nativa do navegador
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  window.speechSynthesis.speak(utterance);
};