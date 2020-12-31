import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpensesComponent } from './expenses/expenses.component'
import { SigninComponent } from './signin/signin.component'

const routes: Routes = [
    { path: "signin", component: SigninComponent},
    { path: "expenses", component: ExpensesComponent},
    { path: "", pathMatch: "full", redirectTo: "signin"},
    { path: "**", redirectTo: "signin"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
