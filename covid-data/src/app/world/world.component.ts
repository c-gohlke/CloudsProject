import { Component, OnInit, ViewChild } from '@angular/core';
import { worldDataService } from '../services/world-data.service';
import { countryListService } from '../services/country-list.service';
import { userService } from '../services/user.service';
import { monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {
  
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  constructor(public worldDataService: worldDataService, public countryListService: countryListService, public userService: userService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  };

  ngOnInit(): void {
  }
}