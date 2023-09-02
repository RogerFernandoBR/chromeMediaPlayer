import { Component } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-button-mode',
  templateUrl: './button-mode.component.html',
  styleUrls: ['./button-mode.component.scss']
})
export class ButtonModeComponent {

  constructor(private layoutService: LayoutService) {}

  toggleColorMode() {
    this.layoutService.toggleColorMode();
  }
}
