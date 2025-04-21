import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IUploadInterface } from 'src/app/interfaces/_interfaces';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent {
  prev_url : any;

  uploadObj: IUploadInterface = {
    text: "Arraste sua midia aqui ou clique para procurar!",
    icon: {
      name: "image-plus",
      size: "90",
      stroke: 0.5
    }
  }
  constructor(
    private sanitizer : DomSanitizer
  ) {}

  onSelectedFile(ev : any) {
    let file = ev.target.files[0];
    var URL = window.URL;
    this.prev_url = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }

  triggerUpload() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();  // Impede o comportamento padrão (como abrir a midia no navegador)
    event.stopPropagation();  // Impede que o evento se propague
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer?.files[0]; // Obtém o arquivo arrastado
    if (file?.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.autoplay = false;
      video.muted = true;
      video.src = URL.createObjectURL(file);  
      this.prev_url = this.sanitizer.bypassSecurityTrustUrl(video.src);
    }
  }
}
