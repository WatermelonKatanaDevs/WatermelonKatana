const Mongoose = require("mongoose");
const fs = require("fs");

const ProjectDataSchema = new Mongoose.Schema({}, { strict: false });

const ProjectData = Mongoose.model("projects", ProjectDataSchema);

const TurboDB = async function(id) {
  var db = {};
  db._data = await ProjectData.findById(id);
  if (!db._data) {
    db._data = await ProjectData.create({
      _id:id,
      tables:{},
      keyvalues:{},
    });
  }
  db.getKeyValue = function(key) {
    return this._data.keyvalues[key];
  };
  db.getAllKeyValues = function() {
    return this._data.keyvalues;
  };
  db.setKeyValue = function(key,value) {
    this._data.keyvalues[key] = value;
    this._data.save();
    return true;
  };
  db.populateKeyValues = function(map) {
    for (i in map) {
      this._data.keyvalues[i] = map[i];
    }
    this._data.save();
    return true;
  };
  db.deleteKeyValue = function(key) {
    delete this._data.keyvalues[key];
    this._data.save();
    return true;
  };
  // table paths
  db.createRecord = function(table_name, record_json) {
    if (typeof table_name !== "string" || (typeof record_json !== "object" && record_json !== null)) throw `invalid argument table "${table_name}" or record "${record_json}"`;
    let table = this._data.tables;
    if (table[table_name] === undefined) table[table_name] = { records: [], nextId: 1 };
    record_json.id = table[table_name].nextId++;
    table[table_name].records.push(record_json)
    this._data.save();
    return { table_name, record_json };
  };
  db.createTable = function(table_name) {
    if (typeof table_name !== "string") throw `unable to create a table wihout a name`;
    let table = this._data.tables;
    if (table[table_name] === undefined) table[table_name] = { records: [], nextId: 1 };
    this._data.save();
    return true;
  };
  db.addColumn = function(column_name, table_name) {
    if (typeof column_name !== "string" || typeof table_name !== "string") throw `invalid argument table "${table_name}" or column "${column_name}"`;
    let table = this._data.tables[table_name];
    if (table === undefined) throw `unable to create a column without a table`;
    for (let record of table.records) {
      record[column_name] = null;
    }
    this._data.save();
    return true;
  };
  /*db.add_shared_table = function(table_name) {
    let file = `${path || __dirname}/${table_name}.csv`
    if (!fs.existsSync(file)) {
      this._data.tables[table_name] = self.csvToJSON(fs.readFileSync(file, "utf-8"))
      return true;
    }
  };
  db.import_csv = function(table_name, table_data_csv) {
    if (typeof table_name !== "string" || typeof table_data_csv !== "string") throw `unable to import csv table ${table_name} with data ${table_data_csv}`;
    let json = self.csvToJSON(table_data_csv)
    if (json.records.length < 0) throw "there isn't any data in this csv file";
    this._data.tables[table_name] = json;
    this._data.save();
    return true;
  };*/
  db.populateTables = function(map) {
    let table = this._data.tables;
    for (var t in map) {
      if (table[t] === undefined) table[t] = { records: [], nextId: 1 };
      table[t].records = map[t];
      for (let i = 1; i < table[t].records.length + 1; i++) {
        table[t].records[i].id = i;
      }
      table[t].nextId = table[t].records.length + 1;
    }
    this._data.save();
    return true;
  };
  db.updateRecord = function(table_name, record_json) {
    if (typeof table_name !== "string" || (typeof record_json !== "object" && record_json !== null)) throw `unable to update table ${table_name} at id ${table_id}`;
    let table = this._data.tables;
    table = table[table_name];
    for (let i = 0; i < table.records.length; i++) {
      let record = table.records[i];
      if (record.id === record_json.id) {
        table.records[i] = record_json;
        break;
      }
    }
    this._data.save();
    return table.records;
  };
  db.renameColumn = function(table_name, old_column_name, new_column_name) {
    let table = this._data.tables[table_name];
    if (typeof old_column_name !== "string" || typeof new_column_name !== "string" || table === undefined) throw `invalid argument on table "${table_name}" column "${old_column_name}" new column "${new_column_name}"`;
    for (let record of table.records) {
      record[new_column_name] = record[old_column_name];
      delete record[old_column_name];
    }
    this._data.save();
    return true;
  };
  db.coerceColumn = function(table_name, column_name, column_type) {
    let table = this._data.tables[table_name];
    if (typeof column_name !== "string" || column_type.match(/string|number|boolean/)[0] === null || table === undefined) throw `invalid argument on table "${table_name}" column "${column_name}" type "${column_type}"`;
    for (let record of table.records) {
      switch (column_type) {
        case "boolean": {
          record[column_name] = Boolean(record[column_name]);
          break;
        }
        case "number": {
          record[column_name] = Number(record[column_name]);
          break;
        }
        case "string": {
          record[column_name] = String(record[column_name]);
          break;
        }
      }
    }
    this._data.save();
    return true;
  };
  db.getColumnsForTable = function() {
    const columns = ["id"];
    let { table_name } = req.query;
    let table = this._data.tables[table_name];
    if (table === undefined) throw `no table found at "${table_name}"`;
    for (let record of table.records) {
      for (let p in record) {
        if (columns.indexOf(p) < 0) columns.push(p)
      }
    }
    return columns;
  }
  /*db.export_csv = function() {
            let { table_name } = req.query;
      let table = this._data.tables[table_name];
      if (table === undefined) throw `table "${table_name}" cannot be exported`;
      fs.writeFileSync(`${self.csvPath}/${table_name}.csv`, self.jsonToCSV(table.records), "utf-8");
      return true;
  };*/
  db.readRecords = function(table_name) {
    let table = this._data.tables[table_name];
    if (table === undefined) throw `failed to read table ${table_name}`;
    return table.records;
  };
  db.clearTable = function(table_name) {
    let table = this._data.tables
    if (table[table_name] === undefined) throw `failed to clear table "${table_name}"`;
    table[table_name] = { records: [], nextId: 1 };
    this._data.save();
    return true;
  };
  db.deleteRecord = function(table_name, record_id) {
    let table = this._data.tables[table_name];
    var c = false;
    for (let i = 0; i < table.records.length; i++) {
      let record = table.records[i];
      if (record.id === record_id) {
        table.records.splice(i);
        c = true;
        break;
      }
    }
    if (!c) throw `failed to remove record on table "${table_name}" at id "${record_id}"`;
    this._data.save();
    return null;
  };
  db.deleteColumn = function(table_name, column_name) {
    let table = this._data.tables[table_name];
    if (table === undefined) throw `failed to remove column on table "${table_name}" at column "${column_name}"`;
    for (let record of table.records) {
      if (record[column_name] !== undefined) {
        delete record[column_name];
      }
    }
    this._data.save();
    return { table_name, column_name };
  };
  db.deleteTable = function(table_name) {
    let table = this._data.tables;
    if (table[table_name] === undefined) throw`failed to delete the table "${table_name}"`
    delete table[table_name];
    this._data.save();
    return true;
  };
  db.getTableNames = function() {
    return Object.keys(this._data.tables);
  };
  db.getLibraryManifest = function() {
    return {};
  };
  db.projectHasData = function() {
    return Object.keys(this._data.keyvalues).length > 0 || Object.keys(this._data.tables).length > 0;
  };
  db.clearAllData = function() {
    this._data.keyvalues = {};
    this._data.tables = {};
    this._data.save();
    return true;
  };
  return db;
};

var TurboDBList = {};
function createLink(appmethod,name,callback) {
    appmethod("/datablock_storage/:id/"+name,async(req,res)=>{
    try {
      var db = TurboDBList[req.params.id];
      if (db === undefined) {
        db = await TurboDB(req.params.id); 
        TurboDBList[req.params.id] = db;
      }
      res.status(200).send(await callback(db,req));
    } catch(e) {
      res.status(400).send({ "msg": output, "type": output });
    }
  });
}

module.exports = {
  Database: function(app) {
    const c = createLink;
    c(app.get,"get_key_value", (db,req) => db.getKeyValue(req.query.key));
    c(app.get,"get_key_values", db => db.getAllKeyValues());
    c(app.post,"set_key_value", (db,req) => db.setKeyValue(req.body.key,req.body.value));
    c(app.post,"populate_key_values", (db,req) => db.setKeyValue(req.body.key_values_json));
    c(app.delete,"delete_key_value", (db,req) => db.setKeyValue(req.body.key));
    c(app.post,"create_record", (db,req) => db.createRecord(req.body.table_name, req.body.record_json));
    c(app.post,"create_table", (db,req) => db.createTable(req.body.table_name));
    c(app.post,"add_column", (db,req) => db.addColumn(req.body.column_name, req.body.table_name));
    //c(app.post,"add_shared_table", (db,req) => db.add_shared_table(req.body.table_name));
    //c(app.post,"import_csv", (db,req) => db.import_csv(req.body.table_name, req.body.table_data_csv));
    c(app.put,"populate_tables", (db,req) => db.populateTables(req.body.tables_json));
    c(app.put,"update_record", (db,req) => db.updateRecord(req.body.table_name, req.body.record_json));
    c(app.put,"rename_column", (db,req) => db.renameColumn(req.body.table_name, req.body.old_column_name, req.body.new_column_name));
    c(app.put,"coerce_column", (db,req) => db.coerceColumn(req.body.table_name, req.body.column_name, req.body.column_type));
    c(app.get,"get_columns_for_table", (db,req) => db.getColumnsForTable(req.query.table_name));
    //c(app.get,"export_csv", (db,req) => db.export_csv(req.query.table_name));
    c(app.get,"read_records", (db,req) => db.readRecords(req.body.table_name));
    c(app.delete,"delete_record", (db,req) => db.deleteRecord(req.body.table_name, req.body.record_id));
    c(app.delete,"delete_column", (db,req) => db.deleteColumn(req.body.table_name, req.body.column_name));
    c(app.delete,"delete_table", (db,req) => db.deleteTable(req.body.table_name));
    c(app.get,"get_table_names", db => db.getTableNames());
    c(app.get,"get_library_manifest", db => db.getLibraryManifest());
    c(app.get,"project_has_data", db => db.projectHasData());
    c(app.delete,"clear_all_data", db => db.clearAllData());
  }
};
