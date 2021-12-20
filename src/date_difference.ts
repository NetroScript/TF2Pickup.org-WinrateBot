// Source for this file: https://gist.github.com/RienNeVaPlus/024de3431ae95546d60f2acce128a7e2
// Slight modifications have been made to prevent typescript from throwing errors

/**
 * ☃ dateDiff "Snowman Carl" (http://stackoverflow.com/questions/13903897)
 * Returns a detail object about the difference between two dates
 *
 * When providing custom units, provide them in descending order (eg week,day,hour; not hour,day,week)
 *
 * @param {Date} dateStart - date to compare to
 * @param {Date|string} [dateEnd=new Date()] - second date, can be used as unit param instead
 * @param {...string} [units=Object.keys(dateDiffDef)] - limits the returned object to provided keys
 */
export function dateDiff(
  dateStart:	Date,
  dateEnd:	Date | string = new Date,
  ...units:	string[]
): {
  [key: string]: number
} {
  if(typeof dateEnd === 'string')
    dateEnd = new Date();

  let delta: number = Math.abs(dateStart.getTime() - dateEnd.getTime());

  return (units.length ? units : Object.keys(dateDiffDef) as string[])
    .reduce((res: {
      [key: string]: number
    }, key: string) => {
      if(!dateDiffDef.hasOwnProperty(key))
        throw new Error('Unknown unit in dateDiff: '+key);
      res[key] = Math.floor(delta / dateDiffDef[key as keyof typeof dateDiffDef] as number);
      delta -= res[key] * dateDiffDef[key as keyof typeof dateDiffDef];
      return res;
    }, {} as {
      [key: string]: number
    });
}


// default time units for dateDiff
export const dateDiffDef = {
  year:		31536000000,
  month:		2592000000,
  week:		604800000,
  day:		86400000,
  hour:		3600000,
  minute:		60000,
  second:		1000,
};
