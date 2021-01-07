import { Component, OnInit, ViewChild } from '@angular/core';
import { covidDataService } from '../covid-data.service';
import { CovidData } from '../covid-data.model';
import { Label, monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  activeConfirmed: number|undefined;
  deathRate: String|undefined;
  lastUpdated: any;
  newConfirmed: number|undefined;
  newDeaths: number|undefined;
  newRecovered: number|undefined;
  recoveryRate: String|undefined;
  totalConfirmed: number|undefined;
  totalDeaths: number|undefined;
  totalRecovered: number|undefined;
  totalConfirmedLastWeek: number[] = new Array(7);
  totalRecoveredLastWeek: number[] = new Array(7);
  totalDeathsLastWeek: number[] = new Array(7);
  last7days: Array<Date> = new Array(7)
  last7Confirmed: number[] = new Array(7)
  last7Recovered: number[] = new Array(7)
  last7Deaths: number[] = new Array(7)
  sinceApril13: Array<Date> = this.getDaysArray(new Date("2020-04-13"), new Date())
  sinceApril13Confirmed: number[] = new Array(this.sinceApril13.length)
  sinceApril13Recovered: number[] = new Array(this.sinceApril13.length)
  sinceApril13Deaths: number[] = new Array(this.sinceApril13.length)
  todayData: any = new Object();

  getDaysArray(start:Date, end: Date): Array<Date> {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
  };

  private MONTHS: String[] = ["01", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "11", "12"];

  private DAYS: String[] = ["00", "01", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "11", "12", "13", "14", "15", "16", "17",
  "18", "19", "20", "21", "22", "23", "24", "25", "26", "27",
  "28", "29", "30", "31"];

  toDateString(date: Date): string{
    return date.getFullYear() + "-" + this.MONTHS[date.getMonth()] + "-" + this.DAYS[date.getDate()];
  }

  globalDailyData: Array<{ newConfirmed: number, newRecovered: number, newDeaths: number, dateString: string }> = new Array(7);

  public pieChartOptions: ChartOptions = {
    responsive: true,
    title: {
      text: 'Coronavirus Cases Distribution Worldwide',
      display: false
    }
  };
  public pieChartLabels: Label[] = ['Dead Cases', 'Recovered Cases', 'Active Cases'];
  public pieChartData: any[] = [];
  public pieChartType: ChartType = 'pie';

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartLegend: boolean = true;
  public barChartData: any[] = [];
  public barChartLabels: Label[] = new Array(7);

  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  public lineChartOptions = {
    responsive: true,
  };
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  constructor(public covidDataService: covidDataService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  //on start: ----------------------->
  ngOnInit(): void {
    this.updateFirebaseCountries()

    this.updateFirebaseLiveData().then(() =>{

      this.loadLiveData().then((liveData: any) => {
        console.log("Live data loaded")
        this.pieChartData = [{
          data: [
            liveData.get("totalDeaths"),
            liveData.get("totalRecovered"),
            liveData.get("activeConfirmed")
          ],
        }];

        this.todayData = {
          activeConfirmed: liveData.get("activeConfirmed"),
          deathRate: (liveData.get("deathRate")*100).toFixed(2) + "%",
          lastUpdated: liveData.get("lastUpdated"),
          newConfirmed: liveData.get("newConfirmed"),
          newDeaths: liveData.get("newDeaths"),
          newRecovered: liveData.get("newRecovered"),
          recoveryRate: (liveData.get("recoveryRate")*100).toFixed(2) + "%",
          totalConfirmed: liveData.get("totalConfirmed"),
          totalDeaths: liveData.get("totalDeaths"),
          totalRecovered: liveData.get("totalRecovered")
        }
      })
    })
    
    let since: Date = new Date("2020-04-13")
    this.updateFirebaseDailyData(since).then(()=>{

      this.loadWeeklyData().then((data: any)=>{
        console.log("Weekly data loaded")
        this.barChartData = [
          {data: data["totalDeaths"], label: "New Deaths"}, //TODO: most be new
          {data: data["totalRecovered"], label: "New Recovered"}, //TODO: most be new
          {data: data["totalConfirmed"], label: "New Confirmed"} //TODO: most be new
        ]
        this.barChartLabels = Array.from(String(Array(data["totalDeaths"].length).keys()))
      })
      
      this.loadSinceData(since).then((data: any)=>{
        console.log("Since 2020-04-13 data loaded")
        
        this.lineChartData = [
          {data: data["totalDeaths"], label: "Total Deaths"},
          {data: data["totalRecovered"], label: "Total Recovered"},
          {data: data["totalConfirmed"], label: "Total Confirmed"}
        ]
        this.lineChartLabels = Array.from(String(Array(data["totalDeaths"].length).keys()))
      })
    })
  }

  loadLiveData(){
    return this.covidDataService.firestore.collection("daily_data").doc("live").get().toPromise()
  };

  loadWeeklyData(){
    let today = new Date();
    let last_week = new Date(new Date().setDate(today.getDate()-7));
    return this.loadTotalDataFor(this.getDaysArray(last_week, today))
  }

  loadSinceData(since: Date){
    let today = new Date();
    return this.loadTotalDataFor(this.getDaysArray(since, today))
  }

  async loadTotalDataFor(dateArray: Array<Date>): Promise<Object>{
    return this.covidDataService.loadGlobalDailyDataRange(dateArray).then((dailyDataArray)=>{

      let totalConfirmedArray: number[] = new Array()
      let totalRecoveredArray: number[] = new Array()
      let totalDeathsArray: number[] = new Array()

      for (let doc of dailyDataArray){
        totalConfirmedArray.push(doc.get("totalConfirmed"))
        totalRecoveredArray.push(doc.get("totalRecovered"))
        totalDeathsArray.push(doc.get("totalDeaths"))
      }

      return {
        totalConfirmed: totalConfirmedArray,
        totalRecovered: totalRecoveredArray,
        totalDeaths: totalDeathsArray,
      }
    })
  }

  async updateFirebaseLiveData(): Promise<void>{
    return this.covidDataService.checkLiveData().then((updateBool: boolean)=>{
      console.log("checkLiveData updateBool is " + updateBool)
      if (updateBool) {
        console.log("updating live data");
  
        return this.covidDataService.getLiveData().then((res: any) => {
          let tConfirmed: number = res["Global"]["TotalConfirmed"];
          let tDeaths: number = res["Global"]["TotalDeaths"];
          let tRecovered: number = res["Global"]["TotalRecovered"];
  
          let newData: CovidData = {
            activeConfirmed: tConfirmed - tDeaths - tRecovered,
            newConfirmed: res["Global"]["NewConfirmed"],
            deathRate: tDeaths / tConfirmed,
            lastUpdated: new Date(),
            newDeaths: res["Global"]["NewDeaths"],
            newRecovered: res["Global"]["NewRecovered"],
            recoveryRate: tRecovered / tConfirmed,
            totalConfirmed: tConfirmed,
            totalDeaths: tDeaths,
            totalRecovered: tRecovered
          };
          return this.covidDataService.updateLiveData(newData).then(()=>{
            console.log("live data updated")
          })
        });
      }
      else {
        console.log("not updating live data");
        return
      }
    })
  }

  updateFirebaseCountries(){
    this.covidDataService.checkCountriesList().subscribe((checkUpdateCountriesList: boolean) =>{
      if(checkUpdateCountriesList){
        this.covidDataService.getCountriesList().subscribe((countryObjList: any) => {
          let countrySlugList = []
          for (let countryObj of countryObjList) {
            countrySlugList.push(countryObj.Slug)
          }
          this.covidDataService.updateCountriesList(countrySlugList);
        });
      }
    });
  }

  async updateFirebaseDailyData(since: Date){
    let dateArray = this.getDaysArray(since, new Date())
    return this.covidDataService.checkGlobalDailyData(since).then((updateBool: boolean)=>{
      console.log("checkGlobalDailyData updateBool is " + updateBool)
      if (updateBool) {
        console.log("updating daily data");
        return this.covidDataService.getGlobalDailyDataRange(since, new Date()).then((array) => {
          let totalConfirmed: any[] = [];
          let totalRecovered: any[] = [];
          let totalDeaths: any[] = [];
          array.forEach((dataElem: { TotalConfirmed: any; TotalRecovered: any; TotalDeaths: any; }) => {
            totalConfirmed.push(dataElem.TotalConfirmed);
            totalRecovered.push(dataElem.TotalRecovered);
            totalDeaths.push(dataElem.TotalDeaths);
          });
          totalConfirmed = totalConfirmed.sort((a, b) => a - b);
          totalRecovered = totalRecovered.sort((a_1, b_1) => a_1 - b_1);
          totalDeaths = totalDeaths.sort((a_2, b_2) => a_2 - b_2);
  
          for (let index of Array.from(Array(array.length).keys())) {
            this.covidDataService.updateGlobalDailyData(
              totalConfirmed[index],
              totalRecovered[index],
              totalDeaths[index],
              dateArray[index]
            )
          }
          return
        });
      }
      else {
        console.log("not updating daily data");
        return
      }
    })
  }
}