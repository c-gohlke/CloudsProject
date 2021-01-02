import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.model';
import { Router } from '@angular/router';
import { Expense } from './expense.model';

@Injectable({
  providedIn: 'root'
})

export class ExpensesService {
  private user: User | undefined | null;
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore) { 

  }

  async signInWithGoogle(){
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid!: credentials.user?.uid,
      displayName: credentials.user?.displayName,
      email: credentials.user?.email
    };
    localStorage.setItem("user", JSON.stringify(this.user));

    this.updateUserData()
    this.router.navigate(["expenses"]);
  }

  private updateUserData(){
    this.firestore.collection("users").doc(this.user?.uid).set({
      uid: this.user?.uid,
      displayName: this.user?.displayName,
      email: this.user?.email
    }, {merge: true})
  }

  getUser(){
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user")||'{}');
    }
    return this.user;
  }

  userSignedIn(): boolean{
    return localStorage.getItem("user") != null;
  }

  signOut(){
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
    this.router.navigate(["signin"]);
  }

  getExpenses(){
    return this.firestore.collection("users").doc(this.user?.uid)
    .collection("expenses").valueChanges()//#, ref => {ref.orderBy: date, "asc"}
  }

  addExpense(expense?: Expense){
    this.firestore.collection("users").doc(this.user?.uid)
    .collection("expenses").add(expense!);
    this.firestore.collection("users").doc(this.user?.uid)
    .collection("total").doc("expenses")
    .get().subscribe((doc)=>{
      let amount: number;
      if(doc.exists){
        amount = doc.data()!["amount"] + expense!.amount
      }
      else{
        amount = expense!.amount!;
      }

      this.firestore.collection("users").doc(this.user?.uid)
      .collection("total").doc("expenses")
      .set(
        {amount: amount, lastUpdated: new Date()},
        {merge: true}
        )
    });
  }

  getTotal(){
    return this.firestore.collection("users").doc(this.user?.uid)
    .collection("total").doc("expenses").valueChanges();
  }
}
