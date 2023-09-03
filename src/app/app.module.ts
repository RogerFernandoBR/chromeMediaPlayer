import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleChartsModule } from 'angular-google-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AsideComponent } from './components/aside/aside.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContentComponent } from './components/content/content.component';
import { ButtonModeComponent } from './components/button-mode/button-mode.component';
import { UploadComponent } from './components/upload/upload.component';
import { ImagesComponent } from './components/images/images.component';
import { AudioComponent } from './components/audio/audio.component';
import { VideoComponent } from './components/video/video.component';
import { VideoEditComponent } from './components/video-edit/video-edit.component';
import { VideoConverterComponent } from './components/video-converter/video-converter.component';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
