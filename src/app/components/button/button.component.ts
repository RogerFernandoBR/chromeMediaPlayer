import { Component, Input } from '@angular/core';
import { IButtonInterface } from 'src/app/interfaces/button.interface';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() options: IButtonInterface | undefined;

  constructor() {
    this.options = {
      label: "",
      type: "",
    }
  }
}
