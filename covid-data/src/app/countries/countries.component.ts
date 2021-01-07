import { Component, OnInit, ViewChild } from '@angular/core';
import { countryDataService } from '../services/country-data.service';
import { CovidData } from '../models/covid-data.model';
import { Label, monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { __importDefault } from 'tslib';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-country',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  todayData: any = new Object();

  public pieChartOptions: ChartOptions = {
    responsive: true,
    title: {
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

  public country: string = ""

  constructor(public countryDataService: countryDataService, private route: ActivatedRoute) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  };

  ngOnInit(): void {
    this.country = this.route.snapshot.paramMap.get("country")!
    this.updateFirebaseLiveCountryData(this.country).then(() =>{

      this.loadLiveCountryData(this.country).then((liveData: any) => {

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
    this.updateFirebaseDailyCountryData(this.country, since).then(()=>{

      let today = new Date();
      let daysago8 = new Date(new Date().setDate(today.getDate()-7));
      let daysago7 = new Date(new Date().setDate(today.getDate()-6));

      this.loadSinceCountryData(this.country, daysago8, today).then((data: any)=>{

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
          labels.push(this.countryDataService.toDateString(date));
        }
        this.barChartLabels = labels;

      })
      
      this.loadSinceCountryData(this.country, since, today).then((data: any)=>{

        console.log("Since 2020-04-13 data loaded");
        this.lineChartData = [
          {data: data["totalDeaths"], label: "Total Deaths"},
          {data: data["totalRecovered"], label: "Total Recovered"},
          {data: data["totalConfirmed"], label: "Total Confirmed"}
        ];
        let labels: Label[] = new Array();
        for (let date of this.getDaysArray(since, today)){
          labels.push(this.countryDataService.toDateString(date));
        }
        this.lineChartLabels = labels;
      })

    })
  }

  loadLiveCountryData(country: string){
    return this.countryDataService.firestore.collection("daily_data").doc("live")
    .collection("countries").doc(country).get().toPromise();
  };

  loadSinceCountryData(country: string, since: Date, untill: Date){
    return this.loadTotalCountryDataFor(country, this.getDaysArray(since, untill));
  }

  async loadTotalCountryDataFor(country: string, dateArray: Array<Date>): Promise<Object>{
    return this.countryDataService.loadDailyCountryDataRange(country, dateArray).then(async (dailyDataArray)=>{
    
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
        return this.countryDataService.checkLiveCountryData(country).then((updateBool: boolean)=>{
            console.log("checkLiveData updateBool is " + updateBool);
            if (updateBool) {
                console.log("updating live data");
        
                return this.countryDataService.getLiveData().then((res: any) => {
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

                    return this.countryDataService.updateLiveCountryData(country, newData).then(()=>{
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
    const updateBool = await this.countryDataService.checkDailyCountryData(country, since)
    console.log("checkGlobalDailyData updateBool is " + updateBool);
    if (updateBool) {
      console.log("updating daily data");
      const array = await this.countryDataService.getDailyCountryData(country)

      array.forEach((dataElem: any) => {
        this.countryDataService.updateDailyCountryData(
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