import { Component, OnInit, ViewChild } from '@angular/core';
import { worldDataService } from './world-data.service';
import { countryListService } from '../services/country-list.service';
import { monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  constructor(public worldDataService: worldDataService, public countryListService: countryListService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  };

  ngOnInit(): void {
    this.updateFirebaseCountries();
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
}