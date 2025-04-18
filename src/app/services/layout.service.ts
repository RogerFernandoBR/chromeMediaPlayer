import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LayoutService {

  constructor() { 
    this.isMobileViewPortWidth();

    document.getElementsByClassName("grid-mercury")
  }


  // Color mode
  useDarkMode = new BehaviorSubject(true);
  isMobileView = new BehaviorSubject(false);

  toggleColorMode(useDarkMode?: boolean) {
    if (typeof (useDarkMode) == "undefined") useDarkMode = !this.useDarkMode.getValue();
    this.useDarkMode.next(useDarkMode)
  }

  // Aside
  toggleAsideLeft = new BehaviorSubject(false);

  toggleAside(open?: boolean) {
    if (typeof (open) == "undefined") open = !this.toggleAsideLeft.getValue();
    this.toggleAsideLeft.next(open)
  }

  checkViewPortWidth() {
    if (window.innerWidth >= 700) {
      this.toggleAside(false);
    }else {
      this.toggleAside(true);
    }
  }

  isMobileViewPortWidth() {
    if (window.innerWidth >= 700) {
      this.isMobileView.next(true);
    }else {
      this.isMobileView.next(false);
    }
  }
}
