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
  videoId: string = '';
  private proxyBaseUrl = 'http://localhost:3001'; // URL do proxy

  constructor(private layoutService: LayoutService) {
    this.layoutService.useDarkMode.subscribe((x) => {
      this.useDarkMode = x;
    })
  }

  extractVideoId(url: string): string | null {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (let pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
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
      console.log(`[FetchVideoInfo] Buscando info: ${this.youtubeUrl}`);
      
      const response = await fetch(
        `${this.proxyBaseUrl}/info?url=${encodeURIComponent(this.youtubeUrl)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[FetchVideoInfo] Info obtida:', data.title);

      this.videoTitle = data.title || 'Vídeo do YouTube';
      this.videoThumbnail = data.thumbnail || '';
      
      // Armazenar formatos disponíveis para download
      (this as any).availableFormats = data.formats;

      this.isLoading = false;
    } catch (error: any) {
      console.error('[FetchVideoInfo] Erro:', error);
      this.errorMessage = `❌ Erro ao buscar vídeo: ${error.message}`;
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

    try {
      console.log('[Download] Iniciando download');

      // Selecionar o melhor formato baseado no tipo
      const formats = (this as any).availableFormats || [];
      
      if (formats.length === 0) {
        throw new Error('Nenhum formato disponível');
      }

      let selectedFormat;

      if (this.downloadType === 'video') {
        // Filtrar formatos com vídeo E áudio juntos (ex: format 18, 22)
        const combined = formats.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none');

        // Preferir mp4, ordenar por resolução (maior primeiro)
        const mp4Formats = combined
          .filter((f: any) => f.ext === 'mp4')
          .sort((a: any, b: any) => (b.resolution?.replace('p','') || 0) - (a.resolution?.replace('p','') || 0));

        selectedFormat = mp4Formats[0] || combined.sort((a: any, b: any) =>
          (b.resolution?.replace('p','') || 0) - (a.resolution?.replace('p','') || 0))[0];

      } else {
        // Preferir m4a (aac) pois é compatível com todos os players; evitar opus/webm
        const audioFormats = formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
        selectedFormat =
          audioFormats.find((f: any) => f.ext === 'm4a') ||
          audioFormats.find((f: any) => f.ext === 'mp3') ||
          audioFormats[0];
      }

      if (!selectedFormat) {
        throw new Error(`Nenhum formato de ${this.downloadType} disponível`);
      }

      console.log('[Download] Formato selecionado:', selectedFormat.format_id);

      // Iniciar download via proxy passando o tipo desejado
      const downloadUrl = `${this.proxyBaseUrl}/download?url=${encodeURIComponent(
        this.youtubeUrl
      )}&type=${this.downloadType}`;

      const ext = this.downloadType === 'audio' ? 'mp3' : 'mp4';
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${this.videoTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.isLoading = false;
      this.errorMessage = '';
      console.log('[Download] Download iniciado');
    } catch (error: any) {
      console.error('[Download] Erro:', error);
      this.errorMessage = `❌ Erro ao fazer download: ${error.message}`;
      this.isLoading = false;
    }
  }

  clearUrl() {
    this.youtubeUrl = '';
    this.videoTitle = '';
    this.videoThumbnail = '';
    this.videoId = '';
    this.errorMessage = '';
  }
}

