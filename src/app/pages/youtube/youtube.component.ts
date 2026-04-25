import { Component } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent {
  youtubeUrl: string = '';
  useDarkMode: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';
  videoTitle: string = '';
  videoThumbnail: string = '';
  downloadType: 'video' | 'audio' = 'video';
  downloadProgress: string = '';
  private proxyBaseUrl = 'https://youtubeproxy-production.up.railway.app';

  constructor(private layoutService: LayoutService) {
    this.layoutService.useDarkMode.subscribe((x) => (this.useDarkMode = x));
  }

  extractVideoId(url: string): string | null {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (let pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  async fetchVideoInfo() {
    if (!this.youtubeUrl.trim()) {
      this.errorMessage = 'Por favor, insira uma URL do YouTube';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await fetch(
        `${this.proxyBaseUrl}/info?url=${encodeURIComponent(this.youtubeUrl)}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.videoTitle = data.title || 'Vídeo do YouTube';
      this.videoThumbnail = data.thumbnail || '';
    } catch (error: any) {
      this.errorMessage = `❌ Erro ao buscar vídeo: ${error.message}`;
    } finally {
      this.isLoading = false;
    }
  }

  async downloadVideo() {
    if (!this.youtubeUrl.trim()) {
      this.errorMessage = 'Por favor, insira uma URL do YouTube';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.downloadProgress = '';

    try {
      // 1. Obter URLs decifradas do proxy
      this.downloadProgress = '🔍 Obtendo URLs de stream...';
      const streamRes = await fetch(
        `${this.proxyBaseUrl}/stream-url?url=${encodeURIComponent(this.youtubeUrl)}&type=${this.downloadType}`
      );
      if (!streamRes.ok) {
        const err = await streamRes.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${streamRes.status}`);
      }
      const streamData = await streamRes.json();

      if (this.downloadType === 'audio') {
        // Áudio: browser baixa direto da CDN
        this.downloadProgress = '⬇️ Baixando áudio...';
        const audioRes = await fetch(streamData.url);
        if (!audioRes.ok) throw new Error(`CDN áudio: ${audioRes.status}`);
        const blob = await audioRes.blob();
        this.triggerDownload(blob, `${streamData.title || this.videoTitle}.m4a`);
      } else {
        // Vídeo: baixar video+audio separados e mesclar com ffmpeg.wasm
        this.downloadProgress = `⬇️ Baixando vídeo (${streamData.height}p) e áudio...`;
        const [videoRes, audioRes] = await Promise.all([
          fetch(streamData.videoUrl),
          fetch(streamData.audioUrl)
        ]);
        if (!videoRes.ok) throw new Error(`CDN vídeo: ${videoRes.status}`);
        if (!audioRes.ok) throw new Error(`CDN áudio: ${audioRes.status}`);

        const [videoBlob, audioBlob] = await Promise.all([
          videoRes.blob(),
          audioRes.blob()
        ]);

        this.downloadProgress = '🔧 Mesclando vídeo e áudio...';
        const mergedBlob = await this.mergeWithFfmpeg(videoBlob, audioBlob);
        this.triggerDownload(mergedBlob, `${streamData.title || this.videoTitle}.mp4`);
      }

      this.downloadProgress = '✅ Download concluído!';
      setTimeout(() => (this.downloadProgress = ''), 3000);
    } catch (error: any) {
      console.error('[Download] Erro:', error);
      this.errorMessage = `❌ Erro ao fazer download: ${error.message}`;
      this.downloadProgress = '';
    } finally {
      this.isLoading = false;
    }
  }

  private async mergeWithFfmpeg(videoBlob: Blob, audioBlob: Blob): Promise<Blob> {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    await ffmpeg.writeFile('video.mp4', await fetchFile(videoBlob));
    await ffmpeg.writeFile('audio.m4a', await fetchFile(audioBlob));
    await ffmpeg.exec(['-i', 'video.mp4', '-i', 'audio.m4a', '-c', 'copy', 'output.mp4']);
    const data = await ffmpeg.readFile('output.mp4');
    const buffer = (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
    return new Blob([buffer], { type: 'video/mp4' });
  }

  clearUrl() {
    this.youtubeUrl = '';
    this.videoTitle = '';
    this.videoThumbnail = '';
    this.errorMessage = '';
    this.downloadProgress = '';
  }

  private triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
