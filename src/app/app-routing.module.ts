import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutePagesEnum } from './enums/_enums';

import { VideoComponent } from './pages/video/video.component';
import { VideoEditComponent } from './pages/video-edit/video-edit.component';
import { VideoConverterComponent } from './pages/video-converter/video-converter.component';
import { ImagesComponent } from './pages/images/images.component';
import { AudioComponent } from './pages/audio/audio.component';

const routes: Routes = [
  { path: RoutePagesEnum.Root, redirectTo: RoutePagesEnum.Video, pathMatch: 'full'},
  { path: RoutePagesEnum.Video, children: [
      { path: RoutePagesEnum.Root, redirectTo: RoutePagesEnum.VideoPlayer, pathMatch: 'full'},
      { path: RoutePagesEnum.VideoPlayer, component: VideoComponent},
      { path: RoutePagesEnum.VideoEdit, component: VideoEditComponent},
      { path: RoutePagesEnum.VideoConverter, component: VideoConverterComponent},
		]
	},
  { path: RoutePagesEnum.Video, component: VideoComponent},
  { path: RoutePagesEnum.Image, component: ImagesComponent},
  { path: RoutePagesEnum.Audio, component: AudioComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
