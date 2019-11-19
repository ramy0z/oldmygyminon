
      exports.BackTimeToTimeschedule=function(timeScheduleforOneDay, from, to) {
        var interval = JSON.parse(timeScheduleforOneDay)
        // Driver code
        let temp = { start: convertToMin(from), end: convertToMin(to) }
        convertToMin(from)
        let intervalArray = []
        let i = 0;
        Object.keys(interval).forEach(elem => {
          intervalArray.push({ index: i, start: convertToMin(elem), end: convertToMin(interval[elem]) })
          i++;
        });

        let final = 0
        var index = 0;
        var newInterval = {}
        newIntervalTime = []
        var free = findElem(intervalArray, index)

        while (final != -1) {
          if (free) {
            if (free.end > temp.start) {
              if (free.start > temp.start) {
                if (free.index > 0) {
                  index = free.index - 1;
                  free = findElem(intervalArray, index)
                  if (free.end < temp.start) {
                    newIntervalTime = newIntervalTime.concat(joinCurrentTimesWithBackTime(index, temp, intervalArray, newIntervalTime))
                    final = -1
                  }
                }
                else {
                  newInterval.start = temp.start;
                  if (free.start > temp.end) {
                    temp.index = -1;
                    newIntervalTime.push(temp)
                    newIntervalTime = newIntervalTime.concat(intervalArray)
                    final = -1;
                  }
                  else {
                    newIntervalTime = newIntervalTime.concat(joinCurrentTimesWithBackTime(index, temp, intervalArray, newIntervalTime))
                    final = -1
                  }
                }
              }
              else {
                temp.start = free.start
                newIntervalTime = newIntervalTime.concat(joinCurrentTimesWithBackTime(index, temp, intervalArray, newIntervalTime))
                final = -1;
              }
            }
            else if (free.end < temp.start) {
              if (free.index < intervalArray.length - 1) {
                index = free.index + 1;
                free = findElem(intervalArray, index)
                if (free.start > temp.start) {
                  newInterval.start = temp.start
                  newIntervalTime = newIntervalTime.concat(joinCurrentTimesWithBackTime(index, temp, intervalArray, newIntervalTime))
                  final = -1
                }
              }
              else {
                temp.index = free.index + 1;
                newIntervalTime = newIntervalTime.concat(intervalArray)
                newIntervalTime.push(temp)
                final = -1
              }
            }
            else {
              temp.start = free.start
              newIntervalTime = newIntervalTime.concat(joinCurrentTimesWithBackTime(index, temp, intervalArray, newIntervalTime))
              final = -1;
            }
          }
          else {
            final = -1
          }
        }
        return convertArrayOfObjectToStr(newIntervalTime)
      }

      function joinCurrentTimesWithBackTime(index, backTime, oldIntervalTime, newIntervalTime) {
        let final = 0;
        free = findElem(oldIntervalTime, index)
        newIntervalTime = oldIntervalTime.slice(0, index)
        while (final != -1) {
          if (free) {
            if (backTime.end > free.start) {
              if (backTime.end > free.end) {
                index = free.index + 1;
                free = findElem(oldIntervalTime, index);
              }
              else {
                backTime.end = free.end
                if (index == oldIntervalTime.length - 1) {
                  newIntervalTime.push(backTime)
                  final = -1
                }
                index = free.index + 1;
                free = findElem(oldIntervalTime, index);
              }
            }
            else if (backTime.end < free.start) {
              newIntervalTime.push(backTime)
              newIntervalTime = newIntervalTime.concat(oldIntervalTime.slice(index, oldIntervalTime.length))
              final = -1;
            }
            else {
              backTime.end = free.end
              newIntervalTime.push(backTime)
              newIntervalTime = newIntervalTime.concat(oldIntervalTime.slice(index + 1, oldIntervalTime.length))
              final = -1;
            }
          }
          else {
            final = -1
          }
        }
        return newIntervalTime;
      }
      function convertToMin(stringTime) {
        let min = 0;
        minutes = stringTime.split(':')
        min = parseInt(minutes[0]) * 60 + parseInt(minutes[1])
        return min
      }
      function convertToHour(min) {
        minutes = ''
        if (parseInt((min % 60) / 10) == 0) {
          minutes = `0${min % 60}`;
        }
        else {
          minutes = min % 60;
        }
        if(parseInt(min / 60)-10 < 0) hour = `0${parseInt(min / 60)}`;
        else hour =  parseInt(min / 60);
        hour = `${hour}:${minutes}`
        return hour
      }

      function findElem(arr, index) {
        return arr.filter(obj => {
          return obj.index === index
        })[0]
      }

      function convertArrayOfObjectToStr(interval) {
        newInterval='{'
        if(interval&&interval.length>0)
        {
          interval.forEach((elem,index)=>{
        let start = `"${convertToHour(elem['start'])}"`
        let end = `"${convertToHour(elem['end'])}"`
        if(index!=interval.length-1)
        newInterval+=start + ":" + end+','
        else
        newInterval+=start + ":" + end+'}'
      })
        }
        return newInterval;
      }

//module.exports=BackTimeToTimeschedule
