const playAudioBase64 = (base64Data: string) => {
  return new Promise<void>((resolve, reject) => {
    const audioData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
    const audio = new Audio(URL.createObjectURL(blob));

    audio.play().catch((e) => {
      console.log("error playing audio", e);
      reject(e);
    });

    audio.addEventListener("ended", () => {
      resolve();
    });
  });
};

const playAudio = async (audioFile?: ArrayBuffer) => {
  if (audioFile) {
    return playAudioBase64(audioFile.toString());
  }
  
  return Promise.reject("No audio file provided.");
};

export { playAudio };
