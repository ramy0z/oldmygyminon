var db = require('mongoose');
var crypto = require('crypto');
var objectId = require('mongodb').ObjectId;
var dbconnectioncallback = function (req, res, callback, maindb) {
  // if(req.query.public_key)  var dbs=req.query.public_key;else var dbs='maindb';
  // if(maindb) dbs='maindb';
  // if(db.connection.name != dbs){
  //   db.connect('mongodb://localhost:27017/'+dbs,function(err,db){
  //     callback(req,res);
  //   });
  // }else callback(req,res);
  callback(req, res);
}
//add data to table
exports.add = function (req, res, model, data, callback, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    var entry = new model(data);

    entry.save(function (err, product) {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000)
          callback('User already exist!', true);
        else callback(err, true);
      } else
        callback(product, false);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
//add data to table
exports.addmany = function (req, res, model, data, callback, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    // save multiple documents to the collection referenced by Book Model
    model.insertMany(data, function (err, docs) {
      if (err) {
        return console.error(err);
      } else {
        callback(docs);
      }
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

exports.getwithoutpagenation = function (req, res, model, where, select = {}, callback) {
  model.find(where, select, function (err, results) {
    if (err) throw err;
    callback(results);
  });
}
//get data from one table
exports.get = function (req, res, model, where, select = {}, callback, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  //console.log(offset,perpage);
  var resultConnectionCallback = function (req, res) {
    model.find(where, select, function (err, results) {
      if (err) throw err;
      callback(results);
    }).sort(sort).limit(perpage).skip(offset);
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

//get data from one table
exports.getAggregate = function (req, res, model, where, callback, maindb = false, sort = { createdat: -1 }, limit = 30) {
  model.aggregate([
    { $group: where }
  ]).allowDiskUse(true).exec(function (err, result) {
    if (err) throw err;
    callback(result);
  });
}
//get data from one table
exports.ascynget = async function (req, res, model, where, select = {}, maindb = true, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  return await model.find(where, select, function (err, results) {
    if (err) throw err;
    return results;
  })//.sort(sort).limit(perpage).skip(offset);

}
//get data from table join
exports.getJoin = function (req, res, model, table, primary_key, forign_key, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;

  var resultConnectionCallback = function (req, res) {
    model.aggregate([

      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort },

    ]).allowDiskUse(true).exec(function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  //,{allowDiskUse: true}
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
//get data from table join
exports.getJoin2 = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: table2
        }
      }
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort }
    ], function (err, result) {
      if (err) throw err;
      console.log(result)

      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
//get data from table join
exports.getJoin3 = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, table3, primary_key3, forign_key3, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: table2
        }
      }, {
        $lookup: {
          from: table3,
          localField: primary_key3,
          foreignField: forign_key3,
          as: table3
        }
      }
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort },

    ], function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

//get data from table join
exports.getJoin4 = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, table3, primary_key3, forign_key3, table4, primary_key4, forign_key4, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: table2
        }
      }, {
        $lookup: {
          from: table3,
          localField: primary_key3,
          foreignField: forign_key3,
          as: table3
        }
      }, {
        $lookup: {
          from: table4,
          localField: primary_key4,
          foreignField: forign_key4,
          as: table4
        }
      }
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort }
    ], function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

//add data to table
exports.update = function (req, res, model, where, data, callback, updatemany = false, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    var newvalues = { $set: data };
    if (updatemany) {
      model.updateMany(where, newvalues, function (err, result) {
        if (err) throw err;
        callback(result);
      });
    } else {
      model.updateOne(where, newvalues, function (err, result) {
        if (err) throw err;
        callback(result);
      });
    }
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
//add data to table
exports.delete = function (req, res, model, where, callback, deletemany = false, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    if (deletemany) {
      model.deleteMany(where, function (err, result) {
        if (err) throw err;
        callback(result);
      });
    } else {
      model.deleteOne(where, function (err, result) {
        if (err) throw err;
        callback(result);
      });
    }
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
//add data to table
exports.updateoradd = function (req, res, model, where, data, callback, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    model.updateMany(where, data, { upsert: true }, function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

//update multiple collections with different data in the same time
//data must be array of object => obj as{'key':{where},'value':{'updated_field':'updated_value'}
exports.updateManyDataInTheSameTime = function (req, res, model, data, callback, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    var bulk = model.collection.initializeUnorderedBulkOp();
    for (var i = 0; i < data.length; i++) {
      //console.log(data[i].key,data[i].value)
      if (data[i].key && data[i].value)
        bulk.find(data[i].key).update({ $set: data[i].value });
    }

    bulk.execute(function (err, result) {
      if (err) throw err;
      callback(result);
    })
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

exports.insertManyDataInTheSameTime = function (req, res, model, data, callback, maindb = false) {
  var resultConnectionCallback = function (req, res) {
    var bulk = model.collection.initializeUnorderedBulkOp();
    for (var i = 0; i < data.length; i++) {
      //console.log('hii',data[i].key,data[i].value)
      //if(data[i].key && data[i].value)
      bulk.insert(data[i]);
    }

    bulk.execute(function (err, result) {
      if (err) throw err;
      callback(result);
    })
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

exports.getJointest = function (req, res, model, table, primary_key, forign_key, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;

  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      {
        $lookup:
        {
          from: "timescheduals",
          let: { day: "$day", shift_id: "$shift_id" },
          pipeline: [
            {
              $match:
              {
                $expr:
                {
                  $and:
                    [
                      { $eq: ["$day_date", "$$day"] },
                      { $eq: ["$shift_id", "$$shift_id"] }
                    ]
                }
              }
            },
            { $project: { day: 0, shift_id: 0 } }
          ],
          as: "timescheduals"
        }
      }
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort }

    ], function (err, result) {

      if (err) throw err;
      callback(result);
    });
  }
  //,{allowDiskUse: true}
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
//operation database
exports.databaseSumOperations = function (req, res, model, field, callback, where, groupBy) {
  console.log(req.query.filtertime)
  filter = req.query.filtertime
  //Date
  year = (new Date())
  var id = {};
  if (filter == 'weekly') id.day = { $dayOfWeek: `$${groupBy}` }
  if (filter == 'month') id = { month: { $month: `$${groupBy}` }, year: { $year: year } }
  if (req.query.filterloction == 'country') { id.branch_city = '$branch_city', id.status = '$status' }
  if (req.query.filterloction == 'city') {
    id.branch_city = '$branch_city',
      id.branch_country = '$branch_country', id.status = '$status'
  }
  //console.lo
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      { $match: where },
      { $group: { _id: id, total: { $sum: { $convert: { input: `$${field}`, to: "double" } } } } }
    ], function (err, result) {
      if (err) throw err
      callback(result)
    })
  }
  dbconnectioncallback(req, res, resultConnectionCallback);
}

exports.databaseMulOperation = function (req, res, model, opt1, opt2, callback, where, groupBy) {
  var id = {};
  if (req.query.filterloction == 'club') id.club_key = '$club_key'
  if (req.query.filterloction == 'branch') id.branch_key = '$branch_key'
  if (req.query.filterloction == 'units') id.units_key = '$units_key'
  console.log(req.query.filtertime)
  filter = req.query.filter
  if (filter == 'weekly') id = { day: { $dayOfWeek: `$${groupBy}` } }
  console.log(id)
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      { $match: where },

      {
        $group: {
          _id: id,
          total: { $sum: { $multiply: [{ $convert: { input: `$${opt1}`, to: "double" } }, { $convert: { input: `$${opt2}`, to: "double" } }, .01] } },
        }
      }
    ], function (err, result) {
      if (err) throw err
      callback(result)
    })
  }
  dbconnectioncallback(req, res, resultConnectionCallback);
}

exports.databaseCountOperation = function (req, res, model, callback, where, groupBy) {
  var id = {}

  console.log(req.query.filtertime)
  filter = req.query.filtertime
  if (req.query.filterloction == 'country') { id.branch_country = '$branch_country', id.status = '$status' }
  if (req.query.filterloction == 'city') {
    id.branch_city = '$branch_city',
      id.branch_country = '$branch_country', id.status = '$status'
  }
  //if(req.query.filterloction=='units') id.units_key='$units_key'
  console.log(id)
  if (filter == 'weekly') id = { day: { $dayOfWeek: `$${groupBy}` }, hour: '$from' }
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      { $match: where },
      {
        $group: {
          _id: id,
          total: { $sum: 1 },
        },
      },


    ], function (err, result) {
      if (err) throw err
      callback(result)

    })
  }
  dbconnectioncallback(req, res, resultConnectionCallback);
}
//join with group
exports.getJoinWithGroup = function (req, res, model, table, primary_key, forign_key, callback, where = {}, maindb = false) {

  var resultConnectionCallback = function (req, res) {
    model.aggregate([

      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'branch_key',
          foreignField: 'pub_key',
          as: 'users'
        }
      }
      , { $match: where },

      {
        $project: {
          status: '$status',
          user_key: '$pub_key',
          branch_name: '$users.name',
          branch_key: 1,
          branchs: {
            $filter: {
              input: `$${table}`,
              as: "item",
              cond: { $or: [{ $eq: ["$$item.key", 'city'] }, { $eq: ["$$item.key", 'country'] }, { $eq: ["$$item.key", 'lang'] }, { $eq: ["$$item.key", 'lat'] }, { $eq: ["$$item.key", 'name'] }] }
            }
          }

        }
      },
      {
        $group: {
          _id: { users: '$users', branch_data: '$branchs', status: '$status', user_key: '$user_key' },
          branch_transaction: { $sum: 1 }
        }
      }
    ]).allowDiskUse(true).exec(function (err, result) {
      if (err) throw err;
      arr = [{}]

      console.log('branchessss', result[0])
      result.forEach((element, index) => {
        if (element._id.branch_data) {
          obj = {}
          element._id.branch_data.forEach(element => {
            if (element.user_key)
              obj.user_key = element['user_key']
            if (element.status)
              obj.user_key = element['status']
            if (element.key == 'country')
              obj.city = element['value']
            if (element.key == 'city')
              obj.name = element['value']
            if (element.key == 'lang')
              obj.longitude = parseFloat(element['value'])
            if (element.key == 'lat')
              obj.latitude = parseFloat(element['value'])
          });

        }
        if (element.branch_transaction) {
          obj.branch_transaction = element.branch_transaction
        }
        arr[index] = obj

      });

      callback(arr)
    });
  }
  //,{allowDiskUse: true}
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}
exports.getJoin5 = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, table3, primary_key3, forign_key3, table5, primary_key5, forign_key5, table4, primary_key4, forign_key4, callback, where = {}, maindb = false, sort = { day: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;

  var resultConnectionCallback = function (req, res) {
    console.log('data', where)
    model.aggregate([
      { $match: where },

      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: 'units'
        }
      }, {
        $lookup: {
          from: table3,
          localField: primary_key3,
          foreignField: forign_key3,
          as: 'trainer'
        }
      },
      {
        $lookup: {
          from: table5,
          localField: primary_key5,
          foreignField: forign_key5,
          as: 'club'
        }
      }, {
        $lookup: {
          from: table4,
          localField: `${primary_key4}.str`,
          foreignField: `${forign_key4}.str`,
          as: table4
        }
      },
      {
        $lookup: {
          from: 'memberships',
          localField: `${table4}.membership_id`,
          foreignField: '_id',
          as: 'memberships'
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'branch_key',
          foreignField: 'pub_key',
          as: 'branch'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'units_key',
          foreignField: 'pub_key',
          as: 'units'
        }
      }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort }
    ], function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

exports.getRowsCount = function (req, res, model, where, callback) {
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      { $match: where },
      {
        $group: {
          _id: {},
          total: { $sum: 1 },
        },
      },



    ], function (err, result) {
      if (err) throw err
      callback(result)


    })
  }
  dbconnectioncallback(req, res, resultConnectionCallback);
}


exports.getJoinwithFlitration = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  var day = new Date().getTime()
  if(req.body.day)
     day=req.body.day
  console.log('day',day)
  var previousdays = previousDay(day)
  var nextdays = nextDay(day)
  console.log('dayss', previousdays, nextdays)
  if (req.query.day) {
    previousdays = previousDay(req.query.day)
    nextdays = nextDay(req.query.day)
  }
  var resultConnectionCallback = function (req, res) {
    console.log('aaaaaaa',where)
    model.aggregate([
       { $match: where },
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: table2
        }
        ,
      }, {
        $lookup: {
          from: 'users',
          localField: 'club_key',
          foreignField: 'pub_key',
          as: 'club'
        }
        ,
      }, {
        $lookup: {
          from: 'users',
          localField: 'branch_key',
          foreignField: 'pub_key',
          as: 'branch'
        }
        ,
      }, {
        $lookup: {
          from: 'users',
          localField: 'units_key',
          foreignField: 'pub_key',
          as: 'unit'
        }
        ,
      }
     ,
      {
        $project: {
          _id:1,
          type: 1,
          branch_name: `$branch.name`,
          unit_name: `$unit.name`,
          club_name: '$club.name',
          start_date: 1,
          end_date: 1,
          fees: 1,
          branch_country: 1,
          branch_city: 1,
          branch_lat: 1,
          branch_lang: 1,
          memberships: `$${table}`,
          attendances: {
            $filter: {
              input: `$${table2}`,
              as: "item",
              cond: { $and: [{ $gte: ["$$item.day", previousdays] }, { $lte: ["$$item.day", nextdays] },{ $eq: ["$$item.membershipandpayment_id", req.params.membershipandpayments_id] }] }
            }
          }

        }
      }
    
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: {'attendances.day':-1} }
    ], function (err, result) {
     // console.log(result)
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}



exports.getActivity = function (req, res, model,where,callback) {

  var resultConnectionCallback = function (req, res) {
    console.log('hiiiiii')
    model.aggregate([
       { $match: {pub_key:where.pub_key} },
      {
        $lookup: {
          from: 'memberships',
          localField: 'membership_id',
          foreignField: '_id',
          as: 'memberships'
        }
        ,
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id.str',
          foreignField: 'membershipandpayment_id.str',
          as: 'attendance'
        }
        ,
      }, 
      {
        $lookup: {
          from: 'users',
          localField: 'club_key',
          foreignField: 'pub_key',
          as: 'club'
        }
        ,
      }, {
        $lookup: {
          from: 'users',
          localField: 'branch_key',
          foreignField: 'pub_key',
          as: 'branch'
        }
        ,
      }, {
        $lookup: {
          from: 'users',
          localField: 'units_key',
          foreignField: 'pub_key',
          as: 'unit'
        }
        ,
      }
     ,
      {
        $project: {
          _id:1,
          type: 1,
          branch_name: `$branch.name`,
          unit_name: `$unit.name`,
          club_name: '$club.name',
          start_date: 1,
          end_date: 1,
          fees: 1,
          branch_country: 1,
          branch_city: 1,
          branch_lat: 1,
          branch_lang: 1,
          memberships: `$memberships`,
        
          attendances: {
            $filter: {
              input: `$attendance`,
              as: "item",
              cond: { $and: [{ $gte: ["$$item.day", where.firstday] }, { $lte: ["$$item.day", where.endday] },{ $eq: ["$$item.user_key", where.pub_key] }] }
            }
          }

        }
      }
    

    ], function (err, result) {
      console.log(err)
      console.log('res',result)
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback,true);
}



exports.getwithgroup=function(req,res,model,match,callback,group){
  var resultConnectionCallback=function()
  {
  {
    model.aggregate([
      {$match:match},
      {$group: {
        _id: `$${group}`,
        items: {
          $push: '$$ROOT'
        }
      }
    },

    ], function (err, result) {
      if (err) throw err
      var resu=[]
      var obj={}
      if(result.length>0)
      {
        result.forEach(element => {
          obj={}
          obj.branch=element._id
          if(element.items.length>0)
          {
            element.items.forEach(elem=>{
             
            if(elem.key=='country')
           { obj.country=elem.value }
           else if(elem.key=='lang')
            obj.lang=elem.value
           else if(elem.key=='lat')
            obj.lat=elem.value
           else if(elem.key=='city')
            obj.city=elem.value
          
          })
          resu.push(obj)
         
          }
        });
       
      }
      callback(resu)
    })
  }
}
  dbconnectioncallback(req, res, resultConnectionCallback,{});
}

// for transaction for all clubs
exports.logAllClubtransaction = function (req, res, model, group, project, where, callback) {
  try {
    model.aggregate([
      {
        $lookup: {
          from: 'membershipandpayments',
          localField: 'ref_id',
          foreignField: '_id',
          as: 'mPayment'
        }
      }, { "$unwind": "$mPayment" },
      {
        $lookup: {
          from: 'transaction_weights',
          // let: { log_key_state: "$log_key_state", club: "$club" },
          // pipeline: [
          //   {$match:
          //     {$expr:{$and:[{ $eq: ["$trans_key_state", "$$log_key_state"] },{ $eq: ["$club", "$$club"] }]}
          //     }
          //   },
          //  { $project: { club: 0, log_key_state: 0 } }
          // ],
          localField: 'log_key_state',
          foreignField: 'trans_key_state',
          as: 'weights'
        }
      },
      { "$unwind": "$weights" },
      { $match: where },
      { $group: group },
      { $project: project }
    ], function (err, result) {
      if (err) throw err
      callback(result);
    });
  } catch (err) {
    // handle error case
    callback(err);
  }
}
exports.logClubTransaction = function (model, match, callback) {
  try {
      model.aggregate( [ 
        { "$unwind" : "$transDetails" },
        {$match: match},
        { $project:{
            month: "$month",
            club:"$transDetails.club",
            branch:"$transDetails.branch",
            transaction:"$transDetails.transaction",
            calc:"$transDetails.calc",
            tTrans:"$transDetails.tTrans",
            tRevneu:"$transDetails.tRevneu"
        }}
       ]
      ,function (err, result){
        if (err) throw err
        callback(result);
      });
  } catch (err) {
    // handle error case
    callback(err);
  }
}



exports.logClubTransactionwithBranchDetails = function (model, match, callback) {
  try {
    model.aggregate([
      { $unwind: "$transDetails" },
      {
        $lookup: {
          from: 'usermetas',
          localField: 'transDetails.branch',
          foreignField: 'pub_key',
          as: 'branch'
        }

      },
    //   {$match: match},
      {
        $project: {
          month: "$month",
         branchsData: {
            $filter: {
              input: '$branch',
              as: "item",
              cond: { $or: [{ $eq: ["$$item.key", 'city'] }, { $eq: ["$$item.key", 'country'] }, { $eq: ["$$item.key", 'lang'] }, { $eq: ["$$item.key", 'lat'] }, { $eq: ["$$item.key", 'name'] }] }
            }
         },
          
          club: "$transDetails.club",
          branch: "$transDetails.branch",
          transaction: "$transDetails.transaction",
          calc: "$transDetails.calc",
          tTrans: "$transDetails.tTrans",
          tRevneu: "$transDetails.tRevneu"
        }
      },
     
    ]
      , function (err, result) {
        if (err) throw err
        callback(result);
      });
  } catch (err) {
    // handle error case
    callback(err);
  }
}











function previousDay(date) {
  try {
    date = parseInt(date)
    var previousday = new Date(date).setDate(new Date(date).getDate() - 4)
    console.log(new Date(previousday).toISOString().slice(0, 10))
    return new Date(previousday).toISOString().slice(0, 10)
  }
  catch (err) {
    return null
  }

}

function nextDay(date) {
  try {
    date = parseInt(date)
    var nextday = (new Date(date).setDate(new Date(date).getDate() + 4))
    console.log(new Date(nextday).toISOString().slice(0, 10))
    return new Date(nextday).toISOString().slice(0, 10)
  }
  catch (err) {
    return null
  }

}
exports.getfilterClub = function (req, res, model, table, primary_key, forign_key, where = {}, callback, maindb = false, ) {

  var resultConnectionCallback = function (req, res) {
    model.aggregate([
       { $match: where },
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'club_key',
          foreignField: 'pub_key',
          as: 'club'
        }
        ,
      }, {
        $lookup: {
          from: 'users',
          localField: 'branch_key',
          foreignField: 'pub_key',
          as: 'branch'
        }
        ,
      }, 
      // { "$unwind": "$club" },
      // { "$unwind": "$branch" },
      // { "$unwind": `$${table}` },
    ], function (err, result) {
      if (err) throw err;
      console.log('result',result)
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);

}
// for member transaction report join 4 table
exports.memberTransgetJoin4 = function (req, res, model, select, where = {}, callback, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: 'pub_key',
          as: 'users'
        }
      },
      { "$unwind": "$users" },
      {
        $lookup: {
          from: 'membershipandpayments',
          localField: 'ref_id',
          foreignField: '_id',
          as: 'membershipRef'
        }
      }, { "$unwind": "$membershipRef" },
      {
        $lookup: {
          from: 'membershipandpayments',
          localField: 'pref_id',
          foreignField: '_id',
          as: 'membershipParent'
        }
      },
       {
        $lookup: {
          from: 'transaction_weights',
          localField: 'log_key_state',
          foreignField: 'trans_key_state',
          as: 'transaction_weights'
        }
      }, //{ "$unwind": "$transaction_weights" },
      {
        $project: select
      }
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort }
    ], function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}

exports.getJoinWithSelect = function (req, res, model, table, primary_key, forign_key, select={},  where = {}, callback, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;

  dbconnectioncallback(req, res, function(req, res){
     model.aggregate([
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      } 
      ,{ $unwind : "$"+table }
      , {$project: select}
      , { $match: where }
      , { $skip: offset }
      , { $limit: perpage }
      , { $sort: sort },

    ], function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }, maindb);
}

exports.getJoin_2 = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  if (typeof req.query.perpage != 'undefined') var perpage = parseInt(req.query.perpage); else var perpage = limit;
  if (typeof req.query.page != 'undefined') var page = req.query.page; else var page = 1;
  var offset = (page - 1) * perpage;
  var resultConnectionCallback = function (req, res) {
    model.aggregate([
      { $match: where },
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: table2
        }
      }
  
    ], function (err, result) {
      if (err) throw err;
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}




exports.getmembershipswithattendances = function (req, res, model, table, primary_key, forign_key, table2, primary_key2, forign_key2, callback, where = {}, maindb = false, sort = { createdat: -1 }, limit = 30) {
  var resultConnectionCallback = function (req, res) {
    let day=null
    if(req.body.day){
      if(parseInt(req.body.day))
       {
         try {
           let date=parseInt(req.body.day)
           day=new Date(date).getFullYear()
          let m=(new Date(date).getMonth()+1)
           if((m/10)<1) m='0'+m
           day=day+'-'+m
           let d=(new Date(date).getDate())
           if((d/10)<1) d='0'+d
           day=day+'-'+d
         } catch (error) {
           day=null
         }
       }
    }
    console.log('day',day)
    model.aggregate([
      { $match: where },
      {
        $lookup: {
          from: table,
          localField: primary_key,
          foreignField: forign_key,
          as: table
        }
      }, {
        $lookup: {
          from: table2,
          localField: primary_key2,
          foreignField: forign_key2,
          as: table2
        }
        ,
      }
     ,
      {
        $project: {
          type: 1,
          membership_name: `$${table2}.title`,
          _id:1,
          club_key:1,
          branch_key:1,
          units_key:1,
          attendances: {
            $filter: {
              
              input: `$${table}`,
              as: "item",
              cond: { $and:[{'$eq': ['$$item.status','active']},{'$eq': ['$$item.day',day]}] }
            }
          }

        }
      },
      { "$unwind": "$membership_name" }


    
    ], function (err, result) {
     // console.log(result)
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback, maindb);
}


exports.getupcomingSession = function (req, res, model,where,callback) {

  var resultConnectionCallback = function (req, res) {
    
    model.aggregate([
       { $match: {day:{$gte:where.sessionday},status:'active',user_key:where.pub_key} },
       { $sort: { day: 1 } },
       {
        $group:
          {
            _id:'$membershipandpayment_id',
            attendance: { $push : "$$ROOT" }
          }
       },
       {
        $project:
         {
            _id: 1,
            attendance: { $arrayElemAt: [ "$attendance", 0 ] },
         
         }
      }
    

    ], function (err, result) {
      console.log(err)
      console.log('res',result)
      callback(result);
    });
  }
  dbconnectioncallback(req, res, resultConnectionCallback,true);
}