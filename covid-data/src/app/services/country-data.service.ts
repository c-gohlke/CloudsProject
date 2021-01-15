import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { DailyCountryData } from '../models/daily-country-data.model';
import { worldDataService } from './world-data.service';

@Injectable({
  providedIn: 'root'
})
export class countryDataService {
  constructor(
    public worldDataService: worldDataService,
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

  async loadDailyCountryData(country: string, dateArray: Array<Date>): Promise<any>{
    let dailyDataDocArray: Array<any> = [];
    let lastUpdated: number|undefined;

    for (const date of dateArray) {
      dailyDataDocArray.push(await this.firestore.collection("daily_data").doc(this.toDateString(date))
      .collection("countries").doc(country).get().toPromise())
    }
    //find way to load in parallel

    dailyDataDocArray.forEach(dailyDataDoc =>{
      if(dailyDataDoc.get("lastUpdated") && !lastUpdated){
        lastUpdated = dailyDataDoc.get("lastUpdated")
      }
      else if(dailyDataDoc.get("lastUpdated") && lastUpdated! > dailyDataDoc.get("lastUpdated").toDate().getTime()){
        lastUpdated = dailyDataDoc.get("lastUpdated").toDate().getTime()
      }
    })
    
    if(lastUpdated && new Date().getTime() - lastUpdated<1000*3600*24){
      console.log("not updating country daily data")

      let totalConfirmedArray: number[] = new Array();
      let totalRecoveredArray: number[] = new Array();
      let totalDeathsArray: number[] = new Array();
      let dateStringArray: string[] = new Array();

      for (let dataDoc of dailyDataDocArray){
        totalConfirmedArray.push(dataDoc.get("totalConfirmed"));
        totalRecoveredArray.push(dataDoc.get("totalRecovered"));
        totalDeathsArray.push(dataDoc.get("totalDeaths"));
      }
      totalConfirmedArray = totalConfirmedArray.sort((a, b) => a - b);
      totalRecoveredArray = totalRecoveredArray.sort((a_1, b_1) => a_1 - b_1);
      totalDeathsArray = totalDeathsArray.sort((a_2, b_2) => a_2 - b_2);

      for (let index of Array.from(Array(totalConfirmedArray.length).keys())) {
        let dateString: string = this.toDateString(dateArray[index]);
        dateStringArray.push(dateString)
      }
      return {
        dates: dateStringArray,
        totalConfirmed: totalConfirmedArray,
        totalRecovered: totalRecoveredArray,
        totalDeaths: totalDeathsArray,
      };
    } else {
      console.log("updating country daily data")
      const httpOptions = {
        headers: new HttpHeaders({ "Content-Type": "application/json"})
      };
    
      let api_url: string = "https://api.covid19api.com/total/dayone/country/" + country
      let dailyDataArray: any = await this.httpClient.get(api_url, httpOptions).toPromise()

      let dateStringArray: string[] = new Array();
      let totalConfirmedArray: number[] = new Array();
      let totalRecoveredArray: number[] = new Array();
      let totalDeathsArray: number[] = new Array();

      for (let dataElem of dailyDataArray){
        let date: Date = new Date(dataElem["Date"]);
        let dailyCountryData: DailyCountryData = {
          id: this.toDateString(date),
          totalConfirmed: dataElem["Confirmed"],
          totalRecovered: dataElem["Recovered"],
          totalDeaths: dataElem["Deaths"],
          lastUpdated: new Date()
        }
        dateStringArray.push(this.toDateString(date))
        totalConfirmedArray.push(dataElem["Confirmed"]);
        totalRecoveredArray.push(dataElem["Recovered"]);
        totalDeathsArray.push(dataElem["Deaths"]);

        await this.firestore.collection("daily_data").doc(this.toDateString(date)).collection("countries").doc(country).set(dailyCountryData,{merge: true});
      }
      return {
				dates: dateStringArray,
				totalConfirmed: totalConfirmedArray,
				totalRecovered: totalRecoveredArray,
				totalDeaths: totalDeathsArray,
			};
    }
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

  getDaysArray(start:Date, end: Date): Array<Date> {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
  };
}
