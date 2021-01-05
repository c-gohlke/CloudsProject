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

  checkGlobalData(): Observable<boolean>{
    return this.firestore.collection("covid_data").doc("global").valueChanges().pipe(
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

  getGlobalData(){
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    return this.httpClient.get("https://api.covid19api.com/summary", httpOptions)
  }

  updateGlobalData(newData: CovidData){
    this.firestore.collection("covid_data").doc("global").set({
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


  loadGlobalData(): Observable<CovidData>{
    return this.firestore.collection("covid_data").doc("global").valueChanges().pipe(
      map(
        (covidData: any) => {
          let newData: CovidData
          if(covidData){
            newData = {
              activeConfirmed: covidData["activeConfirmed"],
              newConfirmed: covidData["newConfirmed"],
              deathRate: covidData["deathRate"],
              lastUpdated: covidData["lastUpdated"],
              newDeaths: covidData["newDeaths"],
              newRecovered: covidData["newRecovered"],
              recoveryRate: covidData["recoveryRate"],
              totalConfirmed: covidData["totalConfirmed"],
              totalDeaths: covidData["totalDeaths"],
              totalRecovered: covidData["totalRecovered"]
            };
          }
          else{
            newData = {
              activeConfirmed: -1,
              newConfirmed: -1,
              deathRate: -1,
              lastUpdated: null,
              newDeaths: -1,
              newRecovered: -1,
              recoveryRate: -1,
              totalConfirmed: -1,
              totalDeaths: -1,
              totalRecovered: -1
            };
          }
        return newData;
      })
    );
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

  checkGlobalDailyData(date: Date): Observable<boolean>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).valueChanges().pipe(
      map(
        (covidData: any) => {
          console.log("in checkGlobalDailyData, data is:")
          console.log(covidData)
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

  getGlobalDailyData(date: Date){
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    let tomorrow = new Date(date)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let api_url: string = "https://api.covid19api.com/world?from=" + this.toDateString(date) + "T00:00:00Z&to=" +
    this.toDateString(tomorrow) + "T00:00:00Z"

    console.log("api_url for getting global daily data for day " + this.toDateString(date) + " is : " + api_url)

    return this.httpClient.get(api_url, httpOptions)   
  }

  updateGlobalDailyData(newRecovered: number, newConfirmed: number, newDeaths: number, date: Date){
    this.firestore.collection("daily_data").doc(this.toDateString(date)).set(
      {
        newConfirmed: newConfirmed,
        newRecovered: newRecovered,
        newDeaths: newDeaths,
        lastUpdated: new Date()
      },
      {
        merge: true
      }
    );
  }

  loadGlobalDailyData(date: Date): Observable<{newConfirmed: number, newRecovered: number, newDeaths: number}>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).valueChanges().pipe(
      map(
        (dailyData: any) => {
          if(dailyData){
            return {
              newConfirmed: dailyData.newConfirmed,
              newRecovered: dailyData.newRecovered,
              newDeaths: dailyData.newDeaths,
            }
          }
          else{
            return {
              newConfirmed: -1,
              newRecovered: -1,
              newDeaths: -1,
            }
          }
      })
    );
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
