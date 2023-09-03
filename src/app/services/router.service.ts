import { Injectable } from '@angular/core';
import { EventType, NavigationEnd, Route, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RoutePagesEnum } from '../enums/_enums';

@Injectable({
  providedIn: 'root'
})

export class RouterService {

  // Navigation End
  navigationEnd = new BehaviorSubject<NavigationEnd>({urlAfterRedirects: '', type: EventType.NavigationEnd, id: 0, url: ''});

  updateNavigationEnd(instance: NavigationEnd) {
    this.navigationEnd.next(instance)
  }

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.updateNavigationEnd(event)
      }
    });
  }

  getCurrentRoute(): RoutePagesEnum {
    let routePagesValues = Object.values(RoutePagesEnum);
    let routePagesKeys = Object.keys(RoutePagesEnum);
    let route = this.navigationEnd.getValue().url.split("/").pop()?.toString();
    let pageKey;

    routePagesKeys.forEach((key, indexKey) => {
      routePagesValues.forEach((value, indexValue) => {
        if (indexKey == indexValue) {
          if (value == route) {
            pageKey = key.toString();
          }
        } 
      });
    });

    if (pageKey) return RoutePagesEnum[pageKey as keyof typeof RoutePagesEnum];
    else return RoutePagesEnum.Root;
  }
}
