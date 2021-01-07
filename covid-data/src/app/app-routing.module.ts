import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CountriesComponent } from './countries/countries.component';

const routes: Routes = [
    { path: "", component: HomeComponent},
    { path: "countries/:country", component: CountriesComponent},
    { path: "**", redirectTo: "signin"},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
