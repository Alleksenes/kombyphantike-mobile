import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioPlayerService {
  private currentSound: Audio.Sound | null = null;

  async playSentence(text: string) {
    try {
      // Cleanup previous sound
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }

      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const data = await response.json();
      if (data.audio) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${data.audio}` },
          { shouldPlay: true }
        );
        this.currentSound = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            if (this.currentSound === sound) {
                this.currentSound = null;
            }
          }
        });
      }
    } catch (e) {
      console.error("Audio playback failed", e);
      throw e;
    }
  }

  async unload() {
      if (this.currentSound) {
          await this.currentSound.unloadAsync();
          this.currentSound = null;
      }
  }
}

export const AudioPlayer = new AudioPlayerService();
