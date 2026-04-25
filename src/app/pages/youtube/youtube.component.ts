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
      const encodedUrl = encodeURIComponent(this.youtubeUrl);
      if (this.downloadType === 'audio') {
        // Railway faz proxy do áudio
        this.downloadProgress = '⬇️ Baixando áudio...';
        const res = await fetch(`${this.proxyBaseUrl}/audio?url=${encodedUrl}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const blob = await res.blob();
        this.triggerDownload(blob, `${this.videoTitle || 'audio'}.m4a`);
      } else {
        // Railway faz proxy do vídeo (até 1080p)
        this.downloadProgress = '⬇️ Baixando vídeo (até 1080p)...';
        const res = await fetch(`${this.proxyBaseUrl}/video?url=${encodedUrl}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const blob = await res.blob();
        this.triggerDownload(blob, `${this.videoTitle || 'video'}.mp4`);
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
