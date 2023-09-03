import { Component } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  useDarkMode: boolean = true;

  constructor(private layoutService: LayoutService) {
    this.layoutService.useDarkMode.subscribe((x) => {
      this.useDarkMode = x;
    })
  }
}
