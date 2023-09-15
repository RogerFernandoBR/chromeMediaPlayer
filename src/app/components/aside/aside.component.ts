import { Component } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { RoutePagesEnum } from 'src/app/enums/_enums';
import { RouterService } from 'src/app/services/router.service';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent {
  public hideAside: boolean = true;
  public useDarkMode: boolean = true;
  public currentRoute: RoutePagesEnum = RoutePagesEnum.Root;
  public routePages = RoutePagesEnum;
  public showModal: boolean = false;

  constructor(private layoutService: LayoutService, private routerService: RouterService) {
    this.layoutService.toggleAsideLeft.subscribe((x) => {
      this.hideAside = x;
    })

    this.layoutService.useDarkMode.subscribe((x) => {
      this.useDarkMode = x;
    })
    
    this.routerService.navigationEnd.subscribe((event: NavigationEnd)=> {
      this.currentRoute = this.routerService.getCurrentRoute();
    })
  }

  ngOnInit() {
  }

  toggleAside() {
    this.layoutService.toggleAside();
  }

  toggleModal(event: MouseEvent) {
    event.preventDefault();
    this.showModal = !this.showModal;
  }
}
