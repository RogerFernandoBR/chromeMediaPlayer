import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
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
