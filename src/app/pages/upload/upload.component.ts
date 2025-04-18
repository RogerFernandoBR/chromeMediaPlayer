import { Component, Input } from '@angular/core';
import { IUploadInterface } from 'src/app/interfaces/_interfaces';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Input() uploadObj: IUploadInterface | undefined;
  useDarkMode: boolean = true;

  constructor(private layoutService: LayoutService) {
    this.layoutService.useDarkMode.subscribe((x) => {
      this.useDarkMode = x;
    })
  }
}
