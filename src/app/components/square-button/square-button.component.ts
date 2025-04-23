import { Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component } from '@angular/core';
import { ISquareBtnInterface } from 'src/app/interfaces/square-btn.interface';

@Component({
  selector: 'app-square-button',
  templateUrl: './square-button.component.html',
  styleUrls: ['./square-button.component.scss']
})
export class SquareButtonComponent {
    @Input() squareButtonObj!: ISquareBtnInterface;
    @Output() buttonClicked = new EventEmitter<void>();

    onCLick() {
      if (this.squareButtonObj?.action) {
        this.squareButtonObj.action();
      }
    }
}
