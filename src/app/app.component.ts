import { Component, HostListener } from '@angular/core';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

@HostListener('window:resize', ['$event'])

export class AppComponent {
  title = 'portalPortifolio';
  hideAside: boolean = true;
  viewPortWidth: number = window.innerWidth;
  useDarkMode: boolean = true;
  showBackdrop: boolean = false;

  constructor(private layoutService: LayoutService) {
    this.layoutService.toggleAsideLeft.subscribe((x) => {
      this.hideAside = x;
      if (window.innerWidth >= 700) {
        this.showBackdrop = false;
      } else {
        this.showBackdrop = !x;
      }      
    });

    this.layoutService.useDarkMode.subscribe((x) => {
      this.useDarkMode = x;
      let body = document.getElementsByTagName("body")[0];
      body.classList.remove("theme-dark");
      body.classList.remove("theme-light");
      if (x) body.classList.add("theme-dark");
      else body.classList.add("theme-light");
    })
  }

  ngOnInit() {
    this.onResize();    
  }

  toggleAside() {
    this.layoutService.toggleAside();
  }

  onResize() {
    this.layoutService.checkViewPortWidth();
  }
}
