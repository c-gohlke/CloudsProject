export class CovidData{
    activeConfirmed: number|undefined;
    deathRate: number|undefined;
    lastUpdated: any;
    newConfirmed: number|undefined
    newDeaths: number|undefined
    newRecovered: number|undefined
    recoveryRate: number|undefined
    totalConfirmed: number|undefined
    totalDeaths: number|undefined
    totalRecovered: number|undefined

    constructor(
        activeConfirmed: number,
        deathRate: number,
        lastUpdated: any,
        newConfirmed: number,
        newDeaths: number,
        newRecovered: number,
        recoveryRate: number,
        totalConfirmed: number,
        totalDeaths: number,
        totalRecovered: number,
        ){
            this.activeConfirmed = activeConfirmed;
            this.deathRate = deathRate;
            this.lastUpdated = lastUpdated;
            this.newConfirmed = newConfirmed;
            this.newDeaths = newDeaths;
            this.newRecovered = newRecovered;
            this.recoveryRate = recoveryRate;
            this.totalConfirmed = totalConfirmed;
            this.totalDeaths = totalDeaths;
            this.totalRecovered = totalRecovered;
        }
}