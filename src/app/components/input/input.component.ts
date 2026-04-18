import { Component, Input } from '@angular/core';
import { IInputInterface } from 'src/app/interfaces/_interfaces';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
    @Input() inputObj!: IInputInterface;

    onChange() {
      if (this.inputObj?.action) {
        this.inputObj.action();
      }
    }
}
