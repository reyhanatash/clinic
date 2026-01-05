import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import moment from 'moment-jalaali';


export const RoleMap = new Map([
  ['QE5#AGj@@UV+!Ad2@!msuv6!', 6], //Admin
  ['M)tCXD%Y@uEQTj*@FLmuD)P$', 7], //Secretary - Reception
  ['0N4hrN4RdZiCSgLrDGDY5lU3', 8], //Secretary - Timing
  ['cMI(3H!++nysmyT5CwXe*sVf', 9], //Doctor
  ['S%T6RLp2vtABa@rfTahIg8JZ', 10], //Technician
  ['R#cjGk$RjeXxy%m3bB5KxKUR', 11], //Medical Record
  ['@#(RES2^yQ%AwrJ9(P&rq7&X', 12], //Inpatient
  ['z&pMHUN^K3S#DR@P5+RZbKnB', 13], //Supervisor
  ['%N!jpwfkpMqdw&4W5)qAr79y', 14], //Finance
  ['es*y5#WQwPI3^VLhdcm#@T3E', 15], //Assistant
  ['x(CtV8C5@yarxzd$xPe$F%uv', 16], //Manager
  ['WJDNcw%+nv74^Zrms(G%E!@3', 17], //Secretary Mix
  ['H*5#H)Wf8LRTw%!a#(cK44kC', 18], //Manager - Test
  ['uM54#sJa(3$qjB64rjvT3x24', 19], //Research
])

@Injectable({
  providedIn: 'root'
})

export class UtilService {

  constructor(
    private http: HttpClient
  ) { }


  checkUserType() {
    let secret = localStorage.getItem('xP98_g#d94H0w');
    return RoleMap.get(secret) || -1;
  }



  getBase64(file: any) {
    if (!file) {
      return new Promise((resolve, reject) => {
        resolve('');
      });
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  }

getIranianHolidaysWithFridays(): Observable<string[]> {
  const manualData: Record<string, string[]> = {
    "1403": [
      "1403/01/01","1403/01/02","1403/01/03","1403/01/04","1403/01/05",
      "1403/01/12","1403/01/13","1403/03/14","1403/03/15","1403/04/09",
      "1403/04/10","1403/04/18","1403/04/26","1403/05/17","1403/05/18",
      "1403/06/26","1403/07/15","1403/07/16","1403/07/25","1403/08/05",
      "1403/08/14","1403/09/24","1403/10/04","1403/10/13","1403/11/22",
      "1403/12/29"
    ],
    "1404": [
      "1404/01/01","1404/01/02","1404/01/03","1404/01/04","1404/01/05",
      "1404/01/12","1404/01/13","1404/03/14","1404/03/15","1404/04/11",
      "1404/04/12","1404/04/16","1404/04/24","1404/05/14","1404/05/15",
      "1404/05/23","1404/05/31","1404/06/02","1404/06/10","1404/06/19",
      "1404/09/03","1404/10/13","1404/10/27","1404/11/15","1404/11/22",
      "1404/12/20","1404/12/29"
    ],
    "1405": [
      "1405/01/01","1405/01/02","1405/01/03","1405/01/04","1405/01/05",
      "1405/01/12","1405/01/13","1405/03/14","1405/03/15","1405/03/20",
      "1405/03/21","1405/03/26","1405/04/04","1405/04/25","1405/04/26",
      "1405/05/04","1405/05/12","1405/05/13","1405/05/22","1405/08/31",
      "1405/09/14","1405/09/23","1405/10/16","1405/11/15","1405/11/22",
      "1405/12/29"
    ]
  };
  return new Observable<string[]>(observer => {
    const allYears: string[] = [];
    Object.keys(manualData).forEach(jYear => {
      const official = manualData[jYear] ?? [];

      const fridays: string[] = [];
      let date = moment(`${jYear}/01/01`, 'jYYYY/jMM/jDD');
      while (date.jYear() === parseInt(jYear)) {
        if (date.day() === 5) {
          fridays.push(date.format('jYYYY/jMM/jDD'));
        }
        date.add(1, 'day');
      }

      allYears.push(...official, ...fridays);
    });
    const all = [...new Set(allYears)].sort();
    observer.next(all);
    observer.complete();
  });
}
}
