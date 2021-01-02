export class Expense{
    date: any; 
    description: string|null|undefined;
    amount: number|null|undefined;

    constructor(
        date: Date,
        description: string,
        amount: number
        ){
            this.date = date;
            this.description = description;
            this.amount = amount;
        }
}