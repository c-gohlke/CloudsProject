import { Component, OnInit } from '@angular/core';
import { Expense } from '../expense.model';
import { ExpensesService } from '../expenses.service';
import { User } from '../user.model';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})

export class ExpensesComponent implements OnInit {
  user: User | undefined | null;
  expenses: Expense[]|undefined|null;
  totalAmount: number|undefined;
  lastUpdated: any;

  constructor(public expensesService: ExpensesService){
  }

  ngOnInit(): void {
    this.user = this.expensesService.getUser();
    this.expensesService.getExpenses().subscribe((expenses: any[])=>{
      this.expenses = expenses;
    });
    this.expensesService.getTotal().subscribe((total)=>{
      this.totalAmount = total!["amount"];
      this.lastUpdated = total!["lastUpdated"]
    })
  }
}
