import { Component, OnInit, ViewChild } from '@angular/core';
import { worldDataService } from '../services/world-data.service';
import { countryListService } from '../services/country-list.service';
import { CovidData } from '../models/covid-data.model';
import { Label, monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  todayData: any = new Object();

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
  public barChartLabels: Label[] = [];

  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  public lineChartOptions = {
    responsive: true,
  };
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  constructor(public worldDataService: worldDataService, public countryListService: countryListService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  };

  ngOnInit(): void {
    this.updateFirebaseCountries();

    this.updateFirebaseLiveData().then(() =>{

      this.loadLiveData().then((liveData: any) => {

        console.log("Live data loaded");
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
        };

      });

    });
    
    let since: Date = new Date("2020-04-13");
    this.updateFirebaseDailyData(since).then(()=>{

      let today = new Date();
      let daysago8 = new Date(new Date().setDate(today.getDate()-7));
      let daysago7 = new Date(new Date().setDate(today.getDate()-6));

      this.loadSinceData(daysago8, today).then((data: any)=>{

        console.log("Weekly data loaded");

        let newDeaths = new Array(7)
        let newRecovered = new Array(7)
        let newConfirmed = new Array(7)

        for (let _i=1; _i<data["totalDeaths"].length; _i++){
          newDeaths[_i - 1] =  data["totalDeaths"][_i] - data["totalDeaths"][_i-1]
          newRecovered[_i - 1] =  data["totalRecovered"][_i] - data["totalRecovered"][_i-1] 
          newConfirmed[_i - 1] =  data["totalConfirmed"][_i] - data["totalConfirmed"][_i-1] 
        }

        this.barChartData = [
          {data: newDeaths, label: "New Deaths"},
          {data: newRecovered, label: "New Recovered"},
          {data: newDeaths, label: "New Confirmed"}
        ];

        let labels: Label[] = new Array();
        for (let date of this.getDaysArray(daysago7, today)){
          labels.push(this.worldDataService.toDateString(date));
        }
        this.barChartLabels = labels;

      })
      
      this.loadSinceData(since, today).then((data: any)=>{

        console.log("Since 2020-04-13 data loaded");
        this.lineChartData = [
          {data: data["totalDeaths"], label: "Total Deaths"},
          {data: data["totalRecovered"], label: "Total Recovered"},
          {data: data["totalConfirmed"], label: "Total Confirmed"}
        ];
        let labels: Label[] = new Array();
        for (let date of this.getDaysArray(since, today)){
          labels.push(this.worldDataService.toDateString(date));
        }
        this.lineChartLabels = labels;
      })

    })
  }

  loadLiveData(){
    return this.worldDataService.firestore.collection("daily_data").doc("live").get().toPromise();
  };

  loadSinceData(since: Date, untill: Date){
    return this.loadTotalDataFor(this.getDaysArray(since, untill));
  }

  async loadTotalDataFor(dateArray: Array<Date>): Promise<Object>{
    return this.worldDataService.loadGlobalDailyDataRange(dateArray).then((dailyDataArray)=>{
    
      let totalConfirmedArray: number[] = new Array();
      let totalRecoveredArray: number[] = new Array();
      let totalDeathsArray: number[] = new Array();

      for (let doc of dailyDataArray){
        totalConfirmedArray.push(doc.get("totalConfirmed"));
        totalRecoveredArray.push(doc.get("totalRecovered"));
        totalDeathsArray.push(doc.get("totalDeaths"));
      }

      return {
        totalConfirmed: totalConfirmedArray,
        totalRecovered: totalRecoveredArray,
        totalDeaths: totalDeathsArray,
      };
    })
  }

  async updateFirebaseLiveData(): Promise<void>{
    return this.worldDataService.checkLiveData().then((updateBool: boolean)=>{
      console.log("checkLiveData updateBool is " + updateBool);
      if (updateBool) {
        console.log("updating live data");
  
        return this.worldDataService.getLiveData().then((res: any) => {
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
          return this.worldDataService.updateLiveData(newData).then(()=>{
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

  updateFirebaseCountries(){
    this.countryListService.checkCountriesList().then((checkUpdateCountriesList: boolean) =>{
      if(checkUpdateCountriesList){
        this.countryListService.getCountriesList().subscribe((countryObjList: any) => {
          let countrySlugList = [];
          for (let countryObj of countryObjList) {
            countrySlugList.push(countryObj.Slug);
          }
          this.countryListService.updateCountriesList(countrySlugList);
        });
      }
    });
  }

  async updateFirebaseDailyData(since: Date){
    let dateArray = this.getDaysArray(since, new Date());
    return this.worldDataService.checkGlobalDailyData(since).then((updateBool: boolean)=>{
      console.log("checkGlobalDailyData updateBool is " + updateBool);
      if (updateBool) {
        console.log("updating daily data");
        return this.worldDataService.getGlobalDailyDataRange(since, new Date()).then((array) => {
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
            this.worldDataService.updateGlobalDailyData(
              totalConfirmed[index],
              totalRecovered[index],
              totalDeaths[index],
              dateArray[index]
            );
          }
          return;
        });
      }
      else {
        console.log("not updating daily data");
        return;
      }
    })
  }

  getDaysArray(start:Date, end: Date): Array<Date> {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
  };
}