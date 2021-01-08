import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { CountryComponent } from './country/country.component';

const routes: Routes = [
    { path: "", component: WorldComponent},
    { path: "country/:country", component: CountryComponent},
    { path: "**", redirectTo: "signin"},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
