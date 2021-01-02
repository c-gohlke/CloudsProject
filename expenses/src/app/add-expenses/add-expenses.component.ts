import { Component, OnInit } from '@angular/core';
import { Expense } from '../expense.model';
import { ExpensesService } from '../expenses.service';

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.css']
})
export class AddExpensesComponent implements OnInit {
  date: any;
  description: string|undefined;
  amount: number|undefined;

  constructor(private expensesService: ExpensesService) { }
  ngOnInit(): void {
  }

  addExpense(){
    let expense: Expense = {
      date: new Date(this.date),
      description: this.description,
      amount: this.amount
    }
    this.expensesService.addExpense(expense);

    this.date = undefined;
    this.description = undefined;
    this.amount = undefined;
  };
}
