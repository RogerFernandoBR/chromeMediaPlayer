import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
    LangButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
