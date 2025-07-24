import { useState, useEffect, useCallback } from "react";
import { Message } from "ai";

interface TTSSettings {
  voiceKey: string;
  speed: number;
  volume: number;
}

const DEFAULT_TTS_SETTINGS: TTSSettings = {
  voiceKey: "fa_IR-mana-medium",
  speed: 1,
  volume: 1,
};

export const useTextToSpeech = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [ttsSettings, setTtsSettings] =
    useState<TTSSettings>(DEFAULT_TTS_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem("tts-settings");
    if (stored) {
      setTtsSettings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tts-settings", JSON.stringify(ttsSettings));
  }, [ttsSettings]);

  useEffect(() => {
    if (!audio) return;

    audio.volume = ttsSettings.volume;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio, ttsSettings.volume]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const updateTtsSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setTtsSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const stopAudio = useCallback(() => {
    if (audio) {
      audio.pause();
    }
    setAudio(null);
    setActiveMessage(null);
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    setDuration(0);
  }, [audio]);

  const playAudio = useCallback(
    async (message: Message) => {
      if (activeMessage?.id === message.id && audio) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play();
          setIsPlaying(true);
        }
        return;
      }

      if (audio) {
        audio.pause();
      }

      setActiveMessage(message);
      setIsLoading(true);
      setIsPlaying(false);
      setError(null);
      setProgress(0);
      setDuration(0);

      try {
        const response = await fetch(
          "http://localhost:8001/api/tts/synthesize",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: message.content.replaceAll("*", ""),
              voice_key: ttsSettings.voiceKey,
              speed: ttsSettings.speed,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`TTS service failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const newAudio = new Audio(URL.createObjectURL(blob));
        newAudio.volume = ttsSettings.volume;
        newAudio.playbackRate = ttsSettings.speed;

        setAudio(newAudio);
        newAudio.play();
        setIsPlaying(true);
        setIsLoading(false);

        newAudio.onerror = () => {
          setError("Error playing audio.");
          stopAudio();
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Error fetching TTS audio:", errorMessage);
        setError(errorMessage);
        stopAudio();
      }
    },
    [
      activeMessage?.id,
      audio,
      isPlaying,
      ttsSettings.voiceKey,
      ttsSettings.speed,
      ttsSettings.volume,
      stopAudio,
    ]
  );

  const togglePlayPause = useCallback(() => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [audio, isPlaying]);

  const handleSeek = useCallback(
    (newTime: number) => {
      if (audio) {
        audio.currentTime = newTime;
        setProgress(newTime);
      }
    },
    [audio]
  );

  return {
    playAudio,
    stopAudio,
    togglePlayPause,
    handleSeek,
    activeMessage,
    isPlaying,
    isLoading,
    progress,
    duration,
    error,
    ttsSettings,
    updateTtsSettings,
  };
};
