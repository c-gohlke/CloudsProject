// import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/firestore';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { DailyCountryData } from '../models/daily-country-data.model';
// import { LiveData } from '../models/live-data.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class worldDataService {
//   	constructor(
// 		public firestore: AngularFirestore,
// 		public httpClient: HttpClient
// 	){}

//   	async loadLiveData(country: string = "world"): Promise<any>{
// 		return this.firestore.collection("live_data").doc("live").collection("countries").doc(country).get().toPromise().then((res: any)=>{
// 			if(res.get("lastUpdated") && new Date().getTime() - res.get("lastUpdated").toDate().getTime()<1000*3600*24){
// 				console.log("not updating live data");
// 				let liveCountryData: LiveData = res.data();
// 				liveCountryData.lastUpdated = res.get("lastUpdated").toDate();
// 				return liveCountryData
// 			} else {
// 				console.log("updating live data for country " + country);
// 				const httpOptions = {
// 					headers: new HttpHeaders({ "Content-Type": "application/json"})
// 				};
// 				return this.httpClient.get("https://api.covid19api.com/summary", httpOptions).toPromise().then((summaryData: any)=>{
// 					let tWorldConfirmed: number = summaryData["Global"]["TotalConfirmed"];
// 					let tWorldDeaths: number = summaryData["Global"]["TotalDeaths"];
// 					let tWorldRecovered: number = summaryData["Global"]["TotalRecovered"];
		
// 					let liveWorldData: LiveData = {
// 						activeConfirmed: tWorldConfirmed - tWorldDeaths - tWorldRecovered,
// 						newConfirmed: summaryData["Global"]["NewConfirmed"],
// 						deathRate: tWorldDeaths / tWorldConfirmed,
// 						lastUpdated: new Date(),
// 						newDeaths: summaryData["Global"]["NewDeaths"],
// 						newRecovered: summaryData["Global"]["NewRecovered"],
// 						recoveryRate: tWorldRecovered / tWorldConfirmed,
// 						totalConfirmed: tWorldConfirmed,
// 						totalDeaths: tWorldDeaths,
// 						totalRecovered: tWorldRecovered
// 					};
// 					this.firestore.collection("live_data").doc("live").collection("countries").doc(country).set(liveWorldData, {merge: true});
// 					// localStorage.setItem("daily-live-data", JSON.stringify(liveData));
					
// 					let promptCountryLiveData: LiveData|undefined;
// 					if(country === "world"){
// 						promptCountryLiveData = liveWorldData;
// 					}
		
// 					for (let cDetails of summaryData["Countries"]){
// 						let tConfirmed: number = cDetails["TotalConfirmed"];
// 						let tDeaths: number = cDetails["TotalDeaths"];
// 						let tRecovered: number = cDetails["TotalRecovered"];
// 						let countryData: LiveData = {
// 							activeConfirmed: tConfirmed - tDeaths - tRecovered,
// 							newConfirmed: cDetails["NewConfirmed"],
// 							deathRate: tDeaths / tConfirmed,
// 							lastUpdated: new Date(),
// 							newDeaths: cDetails["NewDeaths"],
// 							newRecovered: cDetails["NewRecovered"],
// 							recoveryRate: tRecovered / tConfirmed,
// 							totalConfirmed: tConfirmed,
// 							totalDeaths: tDeaths,
// 							totalRecovered: tRecovered
// 						};
// 						if(cDetails.Slug === country){
// 							promptCountryLiveData = countryData;
// 						}
// 						this.firestore.collection("live_data").doc("live").collection("countries").doc(cDetails.Slug).set(countryData, {merge: true});
// 						// localStorage.setItem("daily-live-data", JSON.stringify(liveData));
// 					}
// 					return promptCountryLiveData
// 				});
// 			}
// 		});
// 	}
	  
// 	async loadDailyData(dateArray: Array<Date>): Promise<any>{
// 		let dailyDataDocArray: Array<Promise<any>> = [];
// 		let lastUpdated: number = Date.now();
// 		for (const date of dateArray) {
// 			dailyDataDocArray.push(this.firestore.collection("daily_data").doc(this.toDateString(date))
// 			.collection("countries").doc("world").get().toPromise())
// 		}
// 		console.log("before Promise.all, dailyDataDocArray is")
// 		return Promise.all(dailyDataDocArray).then((dailyDataDocArray)=>{
// 			console.log("after Promise.all, dailyDataDocArray is")

// 			dailyDataDocArray.forEach(dailyDataDoc =>{
// 				if(dailyDataDoc.get("lastUpdated") && lastUpdated > dailyDataDoc.get("lastUpdated").toDate().getTime()){
// 					lastUpdated = dailyDataDoc.get("lastUpdated").toDate().getTime()
// 				}
// 			})
			
// 			if(lastUpdated && new Date().getTime() - lastUpdated<1000*3600*24){
// 				console.log("not updating world daily data")
	
// 				let totalConfirmedArray: number[] = new Array();
// 				let totalRecoveredArray: number[] = new Array();
// 				let totalDeathsArray: number[] = new Array();
// 				let dateStringArray: string[] = new Array();
	
// 				for (let dataDoc of dailyDataDocArray){
// 					totalConfirmedArray.push(dataDoc.get("totalConfirmed"));
// 					totalRecoveredArray.push(dataDoc.get("totalRecovered"));
// 					totalDeathsArray.push(dataDoc.get("totalDeaths"));
// 				}
// 				totalConfirmedArray = totalConfirmedArray.sort((a, b) => a - b);
// 				totalRecoveredArray = totalRecoveredArray.sort((a_1, b_1) => a_1 - b_1);
// 				totalDeathsArray = totalDeathsArray.sort((a_2, b_2) => a_2 - b_2);
	
// 				for (let index of Array.from(Array(totalConfirmedArray.length).keys())) {
// 					let dateString: string = this.toDateString(dateArray[index]);
// 					dateStringArray.push(dateString)
// 				}
// 				return {
// 					dates: dateStringArray,
// 					totalConfirmed: totalConfirmedArray,
// 					totalRecovered: totalRecoveredArray,
// 					totalDeaths: totalDeathsArray,
// 				};
// 			} else {
// 				console.log("updating world daily data")
// 				const httpOptions = {
// 					headers: new HttpHeaders({ "Content-Type": "application/json"})
// 				};
			
// 				let api_url: string = "https://api.covid19api.com/world?from=" + this.toDateString(dateArray[0]) + "T00:00:00Z&to=" +
// 				this.toDateString(dateArray[dateArray.length-1]) + "T00:00:00Z"

// 				return this.httpClient.get(api_url, httpOptions).toPromise().then((dailyDataArray: any) =>{
// 					console.log("got daily data array from API")
	
// 					let totalConfirmedArray: number[] = new Array();
// 					let totalRecoveredArray: number[] = new Array();
// 					let totalDeathsArray: number[] = new Array();
// 					let datesArray: string[] = new Array();
		
// 					for (let dailyData of dailyDataArray){
// 						totalConfirmedArray.push(dailyData["TotalConfirmed"]);
// 						totalRecoveredArray.push(dailyData["TotalRecovered"]);
// 						totalDeathsArray.push(dailyData["TotalDeaths"]);
// 					}
// 					totalConfirmedArray = totalConfirmedArray.sort((a, b) => a - b);
// 					totalRecoveredArray = totalRecoveredArray.sort((a_1, b_1) => a_1 - b_1);
// 					totalDeathsArray = totalDeathsArray.sort((a_2, b_2) => a_2 - b_2);
		
// 					for (let index of Array.from(Array(totalConfirmedArray.length).keys())) {
// 						let dateString: string = this.toDateString(dateArray[index]);
// 						datesArray.push(dateString)
		
// 						let worldDailyData: DailyCountryData = {
// 							id: dateString,
// 							totalConfirmed: totalConfirmedArray[index],
// 							totalRecovered: totalRecoveredArray[index],
// 							totalDeaths: totalDeathsArray[index],
// 							lastUpdated: new Date()
// 						}
// 						this.firestore.collection("daily_data").doc(dateString).collection("countries").doc("world")
// 						.set(worldDailyData,{merge: true});
// 						// localStorage.setItem("daily-data-"+this.toDateString(dateArray[index]), JSON.stringify(worldDailyData))
// 					}
// 					return {
// 						dates: datesArray,
// 						totalConfirmed: totalConfirmedArray,
// 						totalRecovered: totalRecoveredArray,
// 						totalDeaths: totalDeathsArray,
// 					};
// 				})
// 			}
// 		});
// 	}


//   toDateString(date: Date): string{
//     return date.getFullYear() + "-" + 
//     ["01", "02", "03", "04", "05", "06", "07",
//     "08", "09", "10", "11", "12"][date.getMonth()]
//     + "-" + 
//     ["00", "01", "02", "03", "04", "05", "06", "07",
//     "08", "09", "10", "11", "12", "13", "14", "15", "16", "17",
//     "18", "19", "20", "21", "22", "23", "24", "25", "26", "27",
//     "28", "29", "30", "31"][date.getDate()
//     ];
//   }

//   getDaysArray(start:Date, end: Date): Array<Date> {
//     for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
//         arr.push(new Date(dt));
//     }
//     return arr;
//   };
// }
