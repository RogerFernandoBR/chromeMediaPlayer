import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutePages } from './enums/_enums';

import { VideoComponent } from './components/video/video.component';
import { VideoEditComponent } from './components/video-edit/video-edit.component';
import { VideoConverterComponent } from './components/video-converter/video-converter.component';
import { ImagesComponent } from './components/images/images.component';
import { AudioComponent } from './components/audio/audio.component';

const routes: Routes = [
  { path: RoutePages.Root, redirectTo: RoutePages.Video, pathMatch: 'full'},
  { path: RoutePages.Video, children: [
      { path: RoutePages.Root, redirectTo: RoutePages.VideoPlayer, pathMatch: 'full'},
      { path: RoutePages.VideoPlayer, component: VideoComponent},
      { path: RoutePages.VideoEdit, component: VideoEditComponent},
      { path: RoutePages.VideoConverter, component: VideoConverterComponent},
		]
	},
  { path: RoutePages.Video, component: VideoComponent},
  { path: RoutePages.Image, component: ImagesComponent},
  { path: RoutePages.Audio, component: AudioComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
