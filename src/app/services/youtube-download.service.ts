import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class YoutubeDownloadService {
  private apiUrl = 'http://localhost:3000/api/youtube'; // Ajuste conforme sua API

  constructor(private http: HttpClient) { }

  getVideoInfo(url: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/info`, { url });
  }

  downloadVideo(url: string, format: 'video' | 'audio'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/download`, 
      { url, format },
      { responseType: 'blob' }
    );
  }
}
