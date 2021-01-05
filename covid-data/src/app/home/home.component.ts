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

  PIE_CHART_TITLE = 'Coronavirus Cases Distribution Worldwide';
  public pieChartOptions: ChartOptions = {
    responsive: true,
    title: {
      text: this.PIE_CHART_TITLE,
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
  public barChartData: any[] = [
    {data:  this.last7Confirmed, label: "New Confirmed"},
    {data:  this.last7Recovered, label: "New Recovered"},
    {data:  this.last7Deaths, label: "New Deaths"}
  ];
  public barChartLabels: Label[] = new Array(7);


  public barChartOptions2: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartType2: ChartType = 'bar';
  public barChartLegend2: boolean = true;
  public barChartData2: any[] = [
    {data:  this.sinceApril13Confirmed, label: "Total Confirmed"},
    {data:  this.sinceApril13Recovered, label: "Total Recovered"},
    {data:  this.sinceApril13Deaths, label: "Total Deaths"}
  ];
  public barChartLabels2: Label[] = new Array(this.sinceApril13.length);

  constructor(public covidDataService: covidDataService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();

    this.last7days = [
      new Date(new Date().setDate(new Date().getDate()-6)),
      new Date(new Date().setDate(new Date().getDate()-5)),
      new Date(new Date().setDate(new Date().getDate()-4)),
      new Date(new Date().setDate(new Date().getDate()-3)),
      new Date(new Date().setDate(new Date().getDate()-2)), 
      new Date(new Date().setDate(new Date().getDate()-1)),
      new Date()
    ];
  }

  ngOnInit(): void {
    this.covidDataService.checkGlobalData().subscribe((checkUpdateData: boolean)=>{
      if(checkUpdateData){
        this.covidDataService.getGlobalData().subscribe((res: any)=>{
          let tConfirmed: number = res["Global"]["TotalConfirmed"];
          let tDeaths: number = res["Global"]["TotalDeaths"];
          let tRecovered: number = res["Global"]["TotalRecovered"];
    
          let newData: CovidData = {
            activeConfirmed: tConfirmed - tDeaths - tRecovered,
            newConfirmed: res["Global"]["NewConfirmed"],
            deathRate: tDeaths/tConfirmed,
            lastUpdated: new Date(),
            newDeaths: res["Global"]["NewDeaths"],
            newRecovered: res["Global"]["NewRecovered"],
            recoveryRate: tRecovered/tConfirmed,
            totalConfirmed: tConfirmed,
            totalDeaths: tDeaths,
            totalRecovered: tRecovered
          };
          this.covidDataService.updateGlobalData(newData);
        });
      }
    });

    this.covidDataService.loadGlobalData().subscribe((covidData: CovidData)=>{
      this.activeConfirmed = covidData["activeConfirmed"];
      this.deathRate = (covidData["deathRate"]!*100).toFixed(2) + "%";
      this.lastUpdated = covidData["lastUpdated"];
      this.newConfirmed = covidData["newConfirmed"];
      this.newDeaths = covidData["newDeaths"];
      this.newRecovered = covidData["newRecovered"];
      this.recoveryRate = (covidData["recoveryRate"]!*100).toFixed(2) + "%";
      this.totalConfirmed = covidData["totalConfirmed"];
      this.totalDeaths = covidData["totalDeaths"];
      this.totalRecovered = covidData["totalRecovered"];

      this.pieChartData = [
        {
          data: [
            this.totalDeaths,
            this.totalRecovered,
            this.activeConfirmed
          ],
        }
      ];
    });

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

    // this.covidDataService.checkCountryDailyData().subscribe((updateBool: boolean)=>{
    //   console.log(updateBool)
    //   if(updateBool){
    //     this.covidDataService.loadCountriesList().subscribe((countryList: any) => {
    //       if(countryList){            
    //         for (let country of ["france", "germany"]){
    //         // for (let country of countryList.slugs){ //TODO
    //           this.covidDataService.getCountryDailyData(country).subscribe((data: any)=>{
    //             console.log("recieved data for country " + country + " of length " + data.length)
    //             // for (var _i = 0; _i < data.length; _i++){
    //             for (var _i = data.length-8; _i < data.length; _i++){
    //               let dailyEntry = data[_i]
    //               for (var _j = 0; _j<7; _j++){
    //                 if(this.toDateString(new Date(dailyEntry.Date)) === this.last7days[_j]){
    //                   this.globalDailyData[_j].newConfirmed = this.globalDailyData[_j].totalConfirmed + dailyEntry.Confirmed
    //                   this.globalDailyData[_j].newRecovered = this.globalDailyData[_j].totalRecovered + dailyEntry.Recovered
    //                   this.globalDailyData[_j].newDeaths = this.globalDailyData[_j].totalDeaths + dailyEntry.Deaths
    //                   this.globalDailyData[_j].dateString = this.toDateString(new Date(dailyEntry.Date))
    //                 }
    //                 console.log()
    //               }
    //               this.covidDataService.updateCountryDailyData(country, new Date(dailyEntry.Date), dailyEntry.Confirmed, dailyEntry.Recovered, dailyEntry.Deaths);
    //             }
    //           });
    //         }
    //         this.covidDataService.updateGlobalDailyData(this.globalDailyData);
    //         this.covidDataService.updateCountryDailyDataTimestamp();
    //       }
    //     });
    //   }
    // });

    // for (let day of this.getDaysArray(new Date("2020-04-13"), new Date())){ //load data since April 13th
    //   this.covidDataService.checkGlobalDailyData(day).subscribe((checkGlobalDailyData: boolean) => {
    //     console.log("checking global daily data for day " + day + ": " + checkGlobalDailyData)

    //     if(checkGlobalDailyData){
    //       this.covidDataService.getGlobalDailyData(day).subscribe((globalDailyData: any)=>{
    //         console.log("getting global daily data for day " + day)
    //         if(globalDailyData && globalDailyData.length==1){
    //           this.covidDataService.updateGlobalDailyData(
    //             globalDailyData[0].NewConfirmed,
    //             globalDailyData[0].NewRecovered,
    //             globalDailyData[0].NewDeaths,
    //             globalDailyData[0].TotalConfirmed,
    //             globalDailyData[0].TotalRecovered,
    //             globalDailyData[0].TotalDeaths,
    //             day
    //             )
    //         }
    //         else {
    //           this.covidDataService.updateGlobalDailyData(
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             day
    //             )
    //         }
    //         console.log("updating global daily data for day " + day)
    //         }
    //       );
    //     }
    //   })
    // }

    // let update = false
    // for (let date of this.sinceApril13){
    //   this.covidDataService.checkGlobalDailyData(date).subscribe((checkGlobalDailyData: boolean) => {
    //     if(checkGlobalDailyData){
    //       update = true
    //       console.log("UPDATE HAS BEEN SET TO TRUE")
    //     }
    //   });
    //   if(update){
    //     this.covidDataService.getGlobalDailyDataRange(this.sinceApril13[0], this.sinceApril13[this.sinceApril13.length - 1])
    //     .subscribe((globalDailyDataArray: any)=>{
    //       console.log(this.sinceApril13.length)
    //       console.log(globalDailyDataArray.length)
    //       for (let _i=0; _i<globalDailyDataArray.length; _i++){
    //         this.covidDataService.updateGlobalDailyData(
    //           globalDailyDataArray[_i].NewConfirmed,
    //           globalDailyDataArray[_i].NewRecovered,
    //           globalDailyDataArray[_i].NewDeaths,
    //           globalDailyDataArray[_i].TotalConfirmed,
    //           globalDailyDataArray[_i].TotalRecovered,
    //           globalDailyDataArray[_i].TotalDeaths,
    //           this.sinceApril13[_i]
    //           )
    //         }
    //       }
    //     );
    //     break
    //   }
    // }

    let update = true
    for (let date of this.sinceApril13){
      this.covidDataService.checkGlobalDailyData(date).subscribe((checkGlobalDailyData: boolean) => {
        if(checkGlobalDailyData && update){
          update = false
          console.log("UPDATE HAS BEEN SET TO TRUE")
          this.covidDataService.getGlobalDailyDataRange(this.sinceApril13[0], this.sinceApril13[this.sinceApril13.length - 1])
          .subscribe((globalDailyDataArray: any)=>{
          for (let _i=0; _i<globalDailyDataArray.length; _i++){
            this.covidDataService.updateGlobalDailyData(
              globalDailyDataArray[_i].NewConfirmed,
              globalDailyDataArray[_i].NewRecovered,
              globalDailyDataArray[_i].NewDeaths,
              globalDailyDataArray[_i].TotalConfirmed,
              globalDailyDataArray[_i].TotalRecovered,
              globalDailyDataArray[_i].TotalDeaths,
              this.sinceApril13[_i]
              )
            }
          });
        }
      });
      if(!update){
        break
      }
    }   

    for (let _i of Array.from(Array(7).keys())){
        this.covidDataService.loadGlobalDailyData(this.last7days[_i]).subscribe((dailyData: any)=>{
        this.last7Confirmed[_i] = dailyData.newConfirmed
        this.last7Recovered[_i] = dailyData.newRecovered
        this.last7Deaths[_i] = dailyData.newDeaths

        this.barChartData = [
          {data: this.last7Deaths, label: "New Deaths"},
          {data: this.last7Recovered, label: "New Recovered"},
          {data: this.last7Confirmed, label: "New Confirmed"}
        ]
      });
      this.barChartLabels[_i] = this.toDateString(this.last7days[_i])
    }

    for (let _i of Array.from(Array(this.sinceApril13.length).keys())){
      this.covidDataService.loadGlobalDailyData(this.sinceApril13[_i]).subscribe((dailyData: any)=>{
      this.sinceApril13Confirmed[_i] = dailyData.totalConfirmed
      this.sinceApril13Recovered[_i] = dailyData.totalRecovered
      this.sinceApril13Deaths[_i] = dailyData.totalDeaths

      this.barChartData2 = [
        {data: this.sinceApril13Deaths, label: "Total Deaths"},
        {data: this.sinceApril13Recovered, label: "Total Recovered"},
        {data: this.sinceApril13Confirmed, label: "Total Confirmed"}
      ]
    });
    this.barChartLabels2[_i] = this.toDateString(this.sinceApril13[_i])
    }
  }

  
}