import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DailyCountryData } from '../models/daily-country-data.model';
import { LiveData } from '../models/live-data.model';

@Injectable({
  providedIn: 'root'
})
export class worldDataService {
  	constructor(
		public firestore: AngularFirestore,
		public httpClient: HttpClient
	){}

  	async loadLiveData(countryList: string[]): Promise<any>{
		return this.firestore.collection("live_data").doc("live").collection("countries").doc("world").get().toPromise().then((res: any)=>{
			if(res.get("lastUpdated") && new Date().getTime() - res.get("lastUpdated").toDate().getTime()<1000*3600*24){
				let countryInfo: any = new Object()
				let liveWorldData: LiveData = res.data();
				let promises: Array<Promise<any>> = [];
				liveWorldData.lastUpdated = res.get("lastUpdated").toDate();
				countryInfo["world"] = liveWorldData
			
				for (let country of countryList){
					promises.push(this.firestore.collection("live_data").doc("live").collection("countries").doc(country).get().toPromise().then((res: any)=>{
						if(res.data()){
							let liveCountryData: LiveData = res.data();
							liveCountryData.lastUpdated = res.get("lastUpdated").toDate();
							countryInfo[country] = liveCountryData
						}
					}));
				}
				return Promise.all(promises).then(()=>{
					return countryInfo
				})
			} else {
				console.log("live data not up to date");
				const httpOptions = {
					headers: new HttpHeaders({ "Content-Type": "application/json"})
				};
				return this.httpClient.get("https://api.covid19api.com/summary", httpOptions).toPromise().then((summaryData: any)=>{
					let countryInfo: any = new Object()

					let tWorldConfirmed: number = summaryData["Global"]["TotalConfirmed"];
					let tWorldDeaths: number = summaryData["Global"]["TotalDeaths"];
					let tWorldRecovered: number = summaryData["Global"]["TotalRecovered"];
		
					let liveWorldData: LiveData = {
						activeConfirmed: tWorldConfirmed - tWorldDeaths - tWorldRecovered,
						newConfirmed: summaryData["Global"]["NewConfirmed"],
						deathRate: tWorldDeaths / tWorldConfirmed,
						lastUpdated: new Date(),
						newDeaths: summaryData["Global"]["NewDeaths"],
						newRecovered: summaryData["Global"]["NewRecovered"],
						recoveryRate: tWorldRecovered / tWorldConfirmed,
						totalConfirmed: tWorldConfirmed,
						totalDeaths: tWorldDeaths,
						totalRecovered: tWorldRecovered
					};

					countryInfo["world"] = liveWorldData
							
					for (let cDetails of summaryData["Countries"]){
						let tConfirmed: number = cDetails["TotalConfirmed"];
						let tDeaths: number = cDetails["TotalDeaths"];
						let tRecovered: number = cDetails["TotalRecovered"];
						let countryData: LiveData = {
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
						countryInfo[cDetails.Slug] = countryData

						this.firestore.collection("live_data").doc("live").collection("countries").doc(cDetails.Slug).set(countryData, {merge: true});
						// localStorage.setItem("daily-live-data", JSON.stringify(liveData));
					}
					let promises: Array<Promise<any>> = [];
					for (let country of countryList){
						if(!Object.keys(countryInfo).includes(country)){
							promises.push(this.firestore.collection("live_data").doc("live")
							.collection("countries").doc(country).get().toPromise().then((res)=>{
								countryInfo[country] = res.data()
							}))
						}
					}
					return Promise.all(promises).then(()=>{
						return countryInfo
					})
				});
			}
		});
	}
	  
	async loadDailyData(dateArray: Array<Date>): Promise<any>{
		let dailyDataDocArray: Array<Promise<any>> = [];
		let lastUpdated: number|undefined;
		for (const date of dateArray) {
			dailyDataDocArray.push(this.firestore.collection("daily_data").doc(this.toDateString(date))
			.collection("countries").doc("world").get().toPromise())
		}
		console.log("before Promise.all, dailyDataDocArray is")
		return Promise.all(dailyDataDocArray).then((dailyDataDocArray)=>{
			dailyDataDocArray.forEach(dailyDataDoc =>{
				if(dailyDataDoc.get("lastUpdated") && (!lastUpdated || lastUpdated > dailyDataDoc.get("lastUpdated").toDate().getTime())){
					lastUpdated = dailyDataDoc.get("lastUpdated").toDate().getTime()
				}
			})
			
			if(lastUpdated && new Date().getTime() - lastUpdated<1000*3600*24){
				console.log("not updating world daily data")
	
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
				console.log("updating world daily data")
				const httpOptions = {
					headers: new HttpHeaders({ "Content-Type": "application/json"})
				};
			
				let api_url: string = "https://corona.lmao.ninja/v2/historical/all"

				return this.httpClient.get(api_url, httpOptions).toPromise().then((dailyDataArray: any) =>{
					console.log("got daily data array from API")
	
					let totalConfirmedArray: number[] = new Array();
					let totalRecoveredArray: number[] = new Array();
					let totalDeathsArray: number[] = new Array();
					let datesArray: string[] = new Array();

					let dates = Object.keys(dailyDataArray["cases"]);
		
					for (let index of Array.from(Array(dates.length).keys())){
						let date = dates[index];
						let dateString: string = this.toDateString(new Date(date));
						let tConfirmed = dailyDataArray["cases"][date];
						let tRecovered = dailyDataArray["recovered"][date];
						let tDeaths = dailyDataArray["deaths"][date];

						totalConfirmedArray.push(tConfirmed);
						totalRecoveredArray.push(tRecovered);
						totalDeathsArray.push(tDeaths);
						datesArray.push(dateString)

						let worldDailyData: DailyCountryData = {
							id: dateString,
							totalConfirmed: tConfirmed,
							totalRecovered: tRecovered,
							totalDeaths: tDeaths,
							lastUpdated: new Date()
						}
						this.firestore.collection("daily_data").doc(dateString)
						.collection("countries").doc("world").set(worldDailyData,{merge: true});
					}

					return {
						dates: datesArray,
						totalConfirmed: totalConfirmedArray,
						totalRecovered: totalRecoveredArray,
						totalDeaths: totalDeathsArray,
					};
				})
			}
		});
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
