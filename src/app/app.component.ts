import { Component, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chromeMediaPlayer';
  prev_url : any;

  constructor(
    private sanitizer : DomSanitizer
  ) {}

  onSelectedFile(ev : any) {
    let file = ev.target.files[0];
    var URL = window.URL;
    this.prev_url = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }
}