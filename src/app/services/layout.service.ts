import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LayoutService {

  constructor() { }


  // Color mode
  useDarkMode = new BehaviorSubject(true);

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
}
