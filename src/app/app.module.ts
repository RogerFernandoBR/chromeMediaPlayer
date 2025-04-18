import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LucideAngularModule, FlipHorizontal2, FlipVertical2, Scissors, Check, Download, Link2, Link2Off } from 'lucide-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AsideComponent } from './components/aside/aside.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContentComponent } from './components/content/content.component';
import { ButtonModeComponent } from './components/button-mode/button-mode.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ImagesComponent } from './pages/images/images.component';
import { AudioComponent } from './pages/audio/audio.component';
import { VideoComponent } from './pages/video/video.component';
import { VideoEditComponent } from './pages/video-edit/video-edit.component';
import { VideoConverterComponent } from './pages/video-converter/video-converter.component';
import { ModalComponent } from './components/modal/modal.component';
import { ButtonComponent } from './components/button/button.component';
import { ButtonCloseComponent } from './components/button-close/button-close.component';
import { LangButtonComponent } from './components/lang-button/lang-button.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AsideComponent,
    NavbarComponent,
    ContentComponent,
    ButtonModeComponent,
    UploadComponent,
    ImagesComponent,
    AudioComponent,
    VideoComponent,
    VideoEditComponent,
    VideoConverterComponent,
    ModalComponent,
    ButtonComponent,
    ButtonCloseComponent,
    LangButtonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LucideAngularModule.pick({ FlipHorizontal2, FlipVertical2, Scissors, Check, Download, Link2, Link2Off }),
    BrowserAnimationsModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
