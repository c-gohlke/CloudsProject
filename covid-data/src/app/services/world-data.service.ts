import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CovidData } from '../models/covid-data.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class worldDataService {
  constructor(
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

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
    totalConfirmed: number,
    totalRecovered: number,
    totalDeaths: number,
    date: Date): Promise<void>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).set(
      {
        id: this.toDateString(date),
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

    let validIDs: Array<String> = new Array()
    for (let date of dateArray){
      validIDs.push(this.toDateString(date))
    }

    return docRef.get().then((collection: any)=>{
      let validDocs: Array<any> = new Array();

      collection.docs.map((doc: any) => {
        if(validIDs.includes(doc.get("id"))){
          validDocs.push(doc)
        }
      })
      return validDocs
    });
  }

  checkGlobalDailyDataRange(startDate: Date, endDate: Date): Promise<boolean>{
    return this.firestore.collection("daily_data").doc(this.toDateString(startDate)).get().toPromise().then((doc)=>{
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
    }) //TODO: improve check
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

  toDateString(date: Date): string{
    return date.getFullYear() + "-" + 
    ["01", "02", "03", "04", "05", "06", "07",
    "08", "09", "10", "11", "12"][date.getMonth()]
    + "-" + 
    ["00", "01", "02", "03", "04", "05", "06", "07",
    "08", "09", "10", "11", "12", "13", "14", "15", "16", "17",
    "18", "19", "20", "21", "22", "23", "24", "25", "26", "27",
    "28", "29", "30", "31"][date.getDate()
    ];
  }
}
