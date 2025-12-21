import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment-jalaali';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: 'NumberSplit' })
export class NumberSplitPipe implements PipeTransform {
  transform(value: any) {
    // if (!value)
    // return;
    return (value / 10).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
}
@Pipe({ name: 'NumberSplitSlash' })
export class NumberSplitSlashPipe implements PipeTransform {
  transform(value: any) {
    // if (!value)
    // return;
    return (value / 10).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1/');
  }
}

@Pipe({ name: 'PriceWithoutTax' })
export class PriceWithoutTaxPipe implements PipeTransform {
  transform(value: any) {
    // if (!value)
    // return;
    let withoutVatPrice;
    let courseAmount = (value / 1.10);
    if (value >= 10000000) {
      withoutVatPrice = Math.round(+courseAmount / 10) * 10;
    } else {
      withoutVatPrice = Math.round(+courseAmount / 10) * 10;
    }
    return withoutVatPrice;
  }
}

@Pipe({ name: 'NumberSplitDot' })
export class NumberSplitDotPipe implements PipeTransform {
  transform(value: any) {
    // if (!value)
    // return;
    return (value / 10).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  }
}

@Pipe({ name: 'inputNumberSplit' })
export class inputNumberSplitPipe implements PipeTransform {
  transform(value: any) {
    if (!value)
      return 0;
    return (value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
}

@Pipe({ name: 'ShamsiDate' })
export class ShamsiDatePipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return '';
    }
    let date = moment(value).format('jYYYY/jMM/jDD');
    return date;
  }
}

@Pipe({ name: 'JustDate' })
export class JustDatePipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return '-';
    }
    let date = moment(value + "Z").format('jYYYY/jMM/jDD');
    return date;
  }
}
@Pipe({ name: 'JustTime' })
export class JustTimePipe implements PipeTransform {
  transform(value: any) {
    let date = moment(value + "Z").format('HH:mm');
    return date;
  }
}

@Pipe({ name: 'ShamsiUTC' })
export class ShamsiUTCPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return '';
    }
    const idate = moment(value + 'Z');
    let date = idate.format('HH:mm')
    return date;
  }
}

@Pipe({ name: 'mySubString' })
export class TextSplit implements PipeTransform {
  transform(value: any, len: number = 30) {
    let res = value;
    if (value.length > len) {
      res = value.substring(0, len) + '...';
    }
    return res;
  }
}

@Pipe({ name: 'courseFilter' })
export class CourseFilter implements PipeTransform {
  transform(value: any, type: any) {
    if (value)
      return value.filter((x: { type: any; }) => x.type == type)

    return null;
  }
}

@Pipe({ name: 'safeSrc' })
export class SafeSRCPipe implements PipeTransform {
  constructor(private santrize: DomSanitizer) { }
  transform(value: any, ...args: any[]) {
    return this.santrize.bypassSecurityTrustResourceUrl(value);
  }
}

@Pipe({ name: 'ShamsiFullDateZone' })
export class ShamsiFullDateZonePipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return '';
    }
    let date = moment(value).format('jYYYY/jMM/jDD');
    let time = moment(value + "Z").format('HH:mm');
    return '<span>' + date + '</span>' + "<br>" + '<span>' + time + '</span>';
  }
}

@Pipe({ name: 'ShamsiFullDate' })
export class ShamsiFullDatePipe implements PipeTransform {
  transform(value: any) {
    let date = moment(value).format('jYYYY/jMM/jDD');
    let time = moment(value).format('HH:mm');
    return '<span>' + date + '</span>' + "<br>" + '<span>' + time + '</span>';
  }
}

@Pipe({ name: 'ShamsiFullDateZonePipeWithLine' })
export class ShamsiFullDateZonePipeWithLine implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return '';
    }
    let date = moment(value).format('jYYYY/jMM/jDD');
    let time = moment(value + "Z").format('HH:mm');
    return '<span>' + date + '</span>' + "<br>" + '<span>' + time + '</span>';
  }
}

@Pipe({ name: 'ShamsiFullDateTicket' })
export class ShamsiFullDateTicketPipe implements PipeTransform {
  transform(value: any) {

    let date = moment(value).format('jYYYY/jMM/jDD');
    let time = moment(value).format('HH:mm');
    return '<span>' + date + '</span>' + "<br>" + '<span>' + time + '</span>';
  }
}

@Pipe({ name: 'NumberSplitPrice' })
export class NumberSplitPricePipe implements PipeTransform {
  transform(value: any) {
    return value ? (value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0;
  }
}

@Pipe({ name: 'CustomTime' })
export class CustomTimePipe implements PipeTransform {
  transform(value: any) {
    if (!value)
      return 0
    const floor = Math.floor(value);
    const h = Math.floor(floor / 3600)
    const m = Math.floor((floor - h * 3600) / 60);
    const s = Math.floor((floor - h * 3600) % 60);

    return h + ":" + m + ":" + s;
  }
}

@Pipe({ name: 'ShamsiFullDateInOneLine' })
export class ShamsiFullDateInOneLine implements PipeTransform {
  transform(value: any) {

    let date = moment(value).format(' HH:mm | jYYYY/jMM/jDD');
    return date;
  }
}
@Pipe({ name: 'ShamsiFullDateInOneLineZone' })
export class ShamsiFullDateInOneLineZone implements PipeTransform {
  transform(value: any) {
    if (!value)
      return null
    else {
      let date = moment(value + "Z").format(' HH:mm | jYYYY/jMM/jDD');
      return date;
    }

  }
}

@Pipe({ name: 'ShamsiTime' })
export class ShamsiTimePipe implements PipeTransform {
  transform(value: any) {

    let date = moment(value).format(' HH:mm ');
    return date;
  }
}
@Pipe({ name: 'ConvertTimeSeconds' })
export class ConvertTimeSeconds implements PipeTransform {
  transform(value: any) {
    let seconds = value;
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);

    minutes %= 60;
    seconds %= 60;

    if (hours > 0) {
      return hours + " : ساعت " + minutes + " : دقیقه " + seconds + " : ثانیه"
    }
    if (minutes > 0) {
      return minutes + " : دقیقه " + seconds + " : ثانیه "
    }
    else {
      return seconds + " : ثانیه "
    }
  }


}

@Pipe({ name: 'ShamsiMonth' })
export class ShamsiMonthPipe implements PipeTransform {
  transform(value: number): string {
    const date = moment(value + "Z").locale('fa').format('jDD jMMMM jYYYY');
    return date;
  }
}

@Pipe({ name: 'JustDateZone' })
export class JustDateZone implements PipeTransform {
  transform(value: any) {
    let date = moment(value).format('jYYYY/jMM/jDD');
    return date;
  }
}