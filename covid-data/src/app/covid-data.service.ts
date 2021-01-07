import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.model';
import { Router } from '@angular/router';
import { CovidData } from './covid-data.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class covidDataService {
  private user: User | undefined | null;
  private MONTHS: String[] = ["01", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "11", "12"];

  private DAYS: String[] = ["00", "01", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "11", "12", "13", "14", "15", "16", "17",
  "18", "19", "20", "21", "22", "23", "24", "25", "26", "27",
  "28", "29", "30", "31"];

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

  async signInWithGoogle(): Promise<void>{
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid!: credentials.user?.uid,
      displayName: credentials.user?.displayName,
      email: credentials.user?.email
    };
    localStorage.setItem("user", JSON.stringify(this.user));

    this.updateUserData()
    this.router.navigate(["covid-data"]);
  }

  private updateUserData(): void{
    this.firestore.collection("users").doc(this.user?.uid).set({
      uid: this.user?.uid,
      displayName: this.user?.displayName,
      email: this.user?.email
    }, {merge: true})
  }

  getUser(): User{
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user")||'{}');
    }
    return this.user!;
  }

  userSignedIn(): boolean{
    return localStorage.getItem("user") != null;
  }

  signOut(): void{
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
    this.router.navigate(["signin"]);
  }

  async checkLiveData(): Promise<boolean>{
    return this.firestore.collection("daily_data").doc("live").get().toPromise().then((doc: any)=>{
      if(doc){
        if(!doc.get("lastUpdated")){
          return true;
        }
        // if lastUpdate happened more than a day ago, fetch new data
        else if(new Date().getTime() - doc.get("lastUpdated").toDate().getTime()>1000*3600*24){
          return true;
        }
        else{
          return false
        }
      }
      else{
        return true;
      }
    });
  }

  getLiveData(){
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };
    return this.httpClient.get("https://api.covid19api.com/summary", httpOptions).toPromise()
  }

  updateLiveData(newData: CovidData): Promise<void>{
    return this.firestore.collection("daily_data").doc("live").set({
      activeConfirmed: newData.activeConfirmed,
      deathRate: newData.deathRate,
      lastUpdated: newData.lastUpdated,
      newConfirmed: newData.newConfirmed,
      newDeaths: newData.newDeaths,
      newRecovered: newData.newRecovered,
      recoveryRate: newData.recoveryRate,
      totalConfirmed: newData.totalConfirmed,
      totalDeaths: newData.totalDeaths,
      totalRecovered: newData.totalRecovered,      
    }, {merge: true})
  }

  async loadLiveData(): Promise<any>{
    return this.firestore.collection("daily_data").doc("live").get().toPromise()
  }

  checkCountryDailyData(): Observable<boolean>{
    return this.firestore.collection("daily_data").doc("lastUpdate").valueChanges().pipe(
      map(
      (lastUpdateDoc: any) => {
        if(lastUpdateDoc){
          if(!lastUpdateDoc["lastUpdated"]){
            return true;
          }
          // if lastUpdate happened more than a day ago, fetch new data
          else if(new Date().getTime() - lastUpdateDoc["lastUpdated"].toDate().getTime()>1000*3600*24){
            return true;
          }
          else{
            return false
          }
        }
        else{
          return true;
        }
      })
    );
  }

  getCountryDailyData(country: string){
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    return this.httpClient.get("https://api.covid19api.com/total/dayone/country/" + country, httpOptions)
  }

  updateCountryDailyData(country: string, date: Date, confirmed: number, recovered: number, deaths: number){
    this.firestore.collection("daily_data").doc(this.toDateString(date)).collection("countries").doc(country).set(
      {
        confirmed: confirmed,
        recovered: recovered,
        deaths: deaths
      },
      {
        merge: true
      }
    );
  }

  updateCountryDailyDataTimestamp(){
    this.firestore.collection("daily_data").doc("lastUpdated").set(
      {
        lastUpdated: new Date(),
      },
      {
        merge: true
      }
    );
  }

  checkGlobalDailyData(date: Date): Promise<boolean>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).get().toPromise().then((covidData: any)=>{
      if (covidData) {
        if (!covidData.get("lastUpdated")) {
          return true;
        }

        // if lastUpdate happened more than a day ago, fetch new data
        else if (new Date().getTime() - covidData.get("lastUpdated").toDate().getTime() > 1000 * 3600 * 24) {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return true;
      }
    })
  }


  getGlobalDailyData(date: Date): Observable<Object>{
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };
    let tomorrow = new Date(date)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let api_url: string = "https://api.covid19api.com/world?from=" + this.toDateString(date) + "T00:00:00Z&to=" +
    this.toDateString(tomorrow) + "T00:00:00Z"
    return this.httpClient.get(api_url, httpOptions)   
  }

  updateGlobalDailyData(
    // newConfirmed: number,
    // newRecovered: number,
    // newDeaths: number,
    totalConfirmed: number,
    totalRecovered: number,
    totalDeaths: number,
    date: Date): Promise<void>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).set(
      {
        // newConfirmed: newConfirmed,
        // newRecovered: newRecovered,
        // newDeaths: newDeaths,
        totalConfirmed: totalConfirmed,
        totalRecovered: totalRecovered,
        totalDeaths: totalDeaths,
        lastUpdated: new Date()
      },
      {
        merge: true
      }
    );
  }

  loadGlobalDailyData(date: Date): Promise<any>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).get().toPromise();
  }

  async loadGlobalDailyDataRange(dateArray: Array<Date>): Promise<any>{
    let docRef = (this.firestore.collection("daily_data").ref);
    // return docRef.where('total_deaths', 'in', ["2020-04-13","2020-04-14","1818008"]).get().then((docs)=>{
    return docRef.get().then((docs)=>{
      return docs.docs
    });
  }

  checkGlobalDailyDataRange(startDate: Date, endDate: Date): Observable<boolean>{
    return this.firestore.collection("daily_data").doc(this.toDateString(startDate)).valueChanges().pipe( //TODO: improve check
      map(
        (covidData: any) => {
          if(covidData){
            if(!covidData["lastUpdated"]){
              return true;
            }
            // if lastUpdate happened more than a day ago, fetch new data
            else if(new Date().getTime() - covidData["lastUpdated"].toDate().getTime()>1000*3600*24){
              return true;
            }
            else{
              return false
            }
          }
          else{
            return true;
          }
        }));
  }

  getGlobalDailyDataRange(startDate: Date, endDate: Date): Promise<any>{
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    let api_url: string = "https://api.covid19api.com/world?from=" + this.toDateString(startDate) + "T00:00:00Z&to=" +
    this.toDateString(endDate) + "T00:00:00Z"
    return this.httpClient.get(api_url, httpOptions).toPromise()
  }

  getGlobalDailyDataRangeTest(startDate: Date, endDate: Date): Promise<Object>{
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    let api_url: string = "https://api.covid19api.com/world?from=" + this.toDateString(startDate) + "T00:00:00Z&to=" +
    this.toDateString(endDate) + "T00:00:00Z"
    return this.httpClient.get(api_url, httpOptions).toPromise()
  }

  checkCountriesList(): Observable<boolean>{
    return this.firestore.collection("countries").doc("countryList").valueChanges().pipe(
      map(
        (countryList: any) => {
          if(countryList){
            if(!countryList["lastUpdated"]){
              return true;
            }
            // if lastUpdate happened more than a day ago, fetch new data
            else if(new Date().getTime() - countryList["lastUpdated"].toDate().getTime()>1000*3600*24){
              return true;
            }
            else{
              return false
            }
          }
          else{
            return true;
          }
        })
      );
  }

  getCountriesList(){
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    return this.httpClient.get("https://api.covid19api.com/countries", httpOptions)
  }

  updateCountriesList(countryList: string[]){
    this.firestore.collection("countries").doc("countryList").set({slugs: countryList}, {merge: true})
    this.firestore.collection("countries").doc("countryList").set({lastUpdated: new Date()}, {merge: true})
  }

  loadCountriesList(){
    return this.firestore.collection("countries").doc("countryList").valueChanges().pipe(
      map(
        (countryList: any) => {
          if(countryList){
            return countryList;
          }
          else{
            return null
          }
      })
    );
  }

  toDateString(date: Date): string{
    return date.getFullYear() + "-" + this.MONTHS[date.getMonth()] + "-" + this.DAYS[date.getDate()];
  }
}
