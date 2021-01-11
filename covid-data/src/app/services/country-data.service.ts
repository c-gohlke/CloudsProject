import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CovidData } from '../models/covid-data.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class countryDataService {
  constructor(
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

  async checkLiveCountryData(country: string): Promise<boolean>{
    return this.firestore.collection("daily_data").doc("live").collection("countries").doc(country).get().toPromise().then((doc: any)=>{
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

  updateLiveCountryData(country: string, newData: CovidData): Promise<void>{
    return this.firestore.collection("daily_data").doc("live").collection("countries").doc(country).set({
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

  async loadLiveCountryData(country: string): Promise<any>{
    return this.firestore.collection("daily_data").doc("live").collection("countries").doc(country).get().toPromise()
  }

  async checkDailyCountryData(country: string, date: Date): Promise<boolean>{
    const covidData = await this.firestore.collection("daily_data").doc(this.toDateString(date)).collection("countries").doc(country).get().toPromise();
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
  }

  updateDailyCountryData(
    country: string,
    totalConfirmed: number,
    totalRecovered: number,
    totalDeaths: number,
    date: Date){
    this.firestore.collection("daily_data").doc(this.toDateString(date)).collection("countries").doc(country).set(
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

  loadDailyCountryData(country: string, date: Date): Promise<any>{
    return this.firestore.collection("daily_data").doc(this.toDateString(date)).collection("countries").doc(country).get().toPromise();
  }

  async loadDailyCountryDataRange(country: string, dateArray: Array<Date>): Promise<any>{
    let docRef = (this.firestore.collection("daily_data").ref);

    let validIDs: Array<String> = new Array()
    for (let date of dateArray){
      validIDs.push(this.toDateString(date))
    }

    const collection = await docRef.get()
    let validDocs: Array<any> = new Array();

    collection.docs.map((doc: any) => {
      if(validIDs.includes(doc.get("id"))){
        validDocs.push(doc)
      }
    });
    return validDocs
  }

  async checkDailyCountryDataRange(country: string, startDate: Date, endDate: Date): Promise<boolean>{
    const covidData = await this.firestore.collection("daily_data").doc(this.toDateString(startDate)).collection("countries").doc(country)
      .get().toPromise();

    if (covidData) {
      if (!covidData.get("lastUpdated")) {
        return true;
      }
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
  }

  getDailyCountryData(country: string): Promise<any>{
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    let api_url: string = "https://api.covid19api.com/total/dayone/country/" + country
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

  loadSinceCountryData(country: string, since: Date, untill: Date){
    return this.loadTotalCountryDataFor(country, this.getDaysArray(since, untill));
  }

  async loadTotalCountryDataFor(country: string, dateArray: Array<Date>): Promise<Object>{
    return this.loadDailyCountryDataRange(country, dateArray).then(async (dailyDataArray)=>{
    
      let totalConfirmedArray: number[] = new Array();
      let totalRecoveredArray: number[] = new Array();
      let totalDeathsArray: number[] = new Array();

      for (let doc of dailyDataArray){
        const docRef = await doc.ref.collection("countries").doc(country).get()

        totalConfirmedArray.push(docRef.get("totalConfirmed"));
        totalRecoveredArray.push(docRef.get("totalRecovered"));
        totalDeathsArray.push(docRef.get("totalDeaths"));
      }

      return {
        totalConfirmed: totalConfirmedArray,
        totalRecovered: totalRecoveredArray,
        totalDeaths: totalDeathsArray,
      };
    })
  }

    async updateFirebaseLiveCountryData(country: string): Promise<void>{
        return this.checkLiveCountryData(country).then((updateBool: boolean)=>{
            console.log("checkLiveData updateBool is " + updateBool);
            if (updateBool) {
                console.log("updating live data");
        
                return this.getLiveData().then((res: any) => {
                    let newData: any
                    for (let cDetails of res["Countries"]){
                        if (cDetails.Slug === country){
                            let tConfirmed: number = cDetails["TotalConfirmed"]
                            let tDeaths: number = cDetails["TotalDeaths"];
                            let tRecovered: number = cDetails["TotalRecovered"];
                            newData = {
                                activeConfirmed: tConfirmed - tDeaths - tRecovered,
                                newConfirmed: cDetails["NewConfirmed"],
                                deathRate: tDeaths / tConfirmed,
                                lastUpdated: new Date(),
                                newDeaths: cDetails["NewDeaths"],
                                newRecovered: cDetails["NewRecovered"],
                                recoveryRate: tRecovered / tConfirmed,
                                totalConfirmed: tConfirmed,
                                totalDeaths: tDeaths,
                                totalRecovered: tRecovered
                            };
                        }
                    }

                    return this.updateLiveCountryData(country, newData).then(()=>{
                        console.log("live data updated");
                    })
                });
            }
            else {
                console.log("not updating live data");
                return;
            }
        })
    }

  async updateFirebaseDailyCountryData(country: string, since: Date){
    const updateBool = await this.checkDailyCountryData(country, since)
    console.log("checkGlobalDailyData updateBool is " + updateBool);
    if (updateBool) {
      console.log("updating daily data");
      const array = await this.getDailyCountryData(country)

      array.forEach((dataElem: any) => {
        this.updateDailyCountryData(
          country,
          dataElem["Confirmed"],
          dataElem["Recovered"],
          dataElem["Deaths"],
          new Date(dataElem["Date"])
        );
      });
    }
    else {
      console.log("not updating daily data");
    }
  }

  getDaysArray(start:Date, end: Date): Array<Date> {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
  };
}
