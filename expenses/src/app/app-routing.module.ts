import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { ExpensesComponent } from './expenses/expenses.component'
import { SecurePagesGuard } from './secure-pages.guard';
import { SigninComponent } from './signin/signin.component'

const routes: Routes = [
    { path: "signin", component: SigninComponent, canActivate: [SecurePagesGuard]},
    { path: "expenses", component: ExpensesComponent, canActivate: [AuthGuard]},
    { path: "", pathMatch: "full", redirectTo: "signin"},
    { path: "**", redirectTo: "signin"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
