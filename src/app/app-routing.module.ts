import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutePages } from './enums/_enums';

import { AboutComponent } from './components/about/about.component';
import { SoftSkillsComponent } from './components/soft-skills/soft-skills.component';
import { HardSkillsComponent } from './components/hard-skills/hard-skills.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: RoutePages.Root, redirectTo: RoutePages.Home, pathMatch: 'full'},
  { path: RoutePages.Home, children: [
      { path: RoutePages.Root, redirectTo: RoutePages.Home, pathMatch: 'full'},
      { path: RoutePages.Home, component: HomeComponent},
      { path: RoutePages.About, component: AboutComponent },
      { path: RoutePages.SoftSkills, component: SoftSkillsComponent},
      { path: RoutePages.HardSkills, component: HardSkillsComponent},
		]
	},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
