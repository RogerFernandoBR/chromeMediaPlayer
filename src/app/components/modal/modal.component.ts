import {Component, EventEmitter, Input, Output} from '@angular/core';
import { IModalInterface, IButtonInterface } from 'src/app/interfaces/_interfaces';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})

export class ModalComponent {
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter<boolean>(); 
  @Input() options: IModalInterface | undefined;

  public buttonCloseOptions: IButtonInterface = {
    label: "Fechar",
    type: "primary",
  }

  toggleModal(){
    this.showModal = !this.showModal;
    this.showModalChange.emit(this.showModal);
  }
}
