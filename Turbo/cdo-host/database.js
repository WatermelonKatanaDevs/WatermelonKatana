const Mongoose = require('mongoose')
const { json } = require('express')
const bigPass = ["populate_key_values", "populate_tables"]
//const fs = require("fs");

const ProjectDataSchema = new Mongoose.Schema(
    {
        _id: String,
        keyvalues: {
            type: Object,
            default: {},
        },
        tables: {
            type: Object,
            default: {},
        },
    },
    { strict: false }
)

const ProjectData = Mongoose.model('projectdata', ProjectDataSchema)

// Database
const TurboDB = async function (id) {
    var db = {}
    db._changed = false
    db._read = true
    db._data = await ProjectData.findOne({ _id: id })
    if (!db._data) {
        db._data = await ProjectData.create({ _id: id })
    }
    db.getKeyValue = function (key) {
        return this._data.keyvalues[key] !== undefined ? this._data.keyvalues[key]: JSON.stringify(null)
    }
    db.getAllKeyValues = function () {
        return this._data.keyvalues
    }
    db.setKeyValue = function (key, value) {
        this._data.keyvalues[key] = value
        this._data.markModified(`keyvalues.${key}`)
        return true
    }
    db.populateKeyValues = function (map) {
        map = typeof map === "string" ? JSON.parse(map): map;
        for (i in map) {
            this._data.keyvalues[i] = map[i];
            this._data.markModified(`keyvalues.${i}`)
        }
        return true
    }
    db.deleteKeyValue = function (key) {
        delete this._data.keyvalues[key]
        this._data.markModified(`keyvalues.${key}`)
        return true
    }
    // table paths
    db.createRecord = function (table_name, record_json) {
        if(typeof table_name !== "string") { throw "invalid argument table" }
        let table = this._data.tables
        record_json = typeof record_json === "string" ? JSON.parse(record_json): record_json;
        if (table[table_name] === undefined) {
            table[table_name] = { records: [], nextId: 1 }
        }
        // table[table_name].id = table[table_name].nextId++
        record_json.id = table[table_name].nextId++;
        table[table_name].records.push(record_json)
        this._data.markModified(`tables.${table_name}`)
        return { table_name, record_json }
    }
    db.createTable = function (table_name) {
        if (typeof table_name !== 'string')
            throw `unable to create a table wihout a name`
        let table = this._data.tables
        if (table[table_name] === undefined)
            table[table_name] = { records: [], nextId: 1 }
        this._data.markModified(`tables.${table_name}`)
        return true
    }
    db.addColumn = function (column_name, table_name) {
        if (typeof column_name !== 'string' || typeof table_name !== 'string')
            throw `invalid argument table "${table_name}" or column "${column_name}"`
        let table = this._data.tables[table_name]
        if (table === undefined)
            throw `unable to create a column without a table`
        for (let record of table.records) {
            record[column_name] = null
        }
        this._data.markModified(`tables.${table_name}.records`)
        return true
    }
    /*db.add_shared_table = function(table_name) {
    let file = `${path || __dirname}/${table_name}.csv`
    if (!fs.existsSync(file)) {
      this._data.tables[table_name] = self.csvToJSON(fs.readFileSync(file, "utf-8"))
    }
    return true;
  };
  db.import_csv = function(table_name, table_data_csv) {
    if (typeof table_name !== "string" || typeof table_data_csv !== "string") throw `unable to import csv table ${table_name} with data ${table_data_csv}`;
    let json = self.csvToJSON(table_data_csv)
    if (json.records.length < 0) throw "there isn't any data in this csv file";
    this._data.tables[table_name] = json;
    this._changed = true;
    return true;
  };*/
    db.populateTables = function (map) {
        let table = this._data.tables
        map = typeof map === "string" ? JSON.parse(map): map;
        for (var t in map) {
            let nextId = 1
            if (table[t] === undefined) table[t] = { records: [], nextId: 1 }
            table[t].records = map[t]
            for (let i = 0; i < table[t].records.length; i++) {
                let id = table[t].records[i].id
                if(typeof id === "number") {
                    nextId = Math.max(nextId, id) + 1
                } else {
                    table[t].records[i].id = nextId++
                }
            }
            table[t].nextId = nextId
            this._data.markModified(`tables.${t}`)
        }
        return true
    }
    db.updateRecord = function (table_name, record_json) {
        if(typeof table_name !== "string") { throw "invalid argument table"}
        let table = this._data.tables
        table = table[table_name]
        record_json = typeof record_json === "string" ? JSON.parse(record_json): record_json;
        for (let i = 0; i < table.records.length; i++) {
            let record = table.records[i]
            if (record.id === record_json.id) {
                table.records[i] = record_json
                this._data.markModified(`tables.${table_name}.records`)
                break
            }
        }
        return table.records
    }
    db.renameColumn = function (table_name, old_column_name, new_column_name) {
        let table = this._data.tables[table_name]
        if (
            typeof old_column_name !== 'string' ||
            typeof new_column_name !== 'string' ||
            table === undefined
        )
            throw `invalid argument on table "${table_name}" column "${old_column_name}" new column "${new_column_name}"`
        for (let record of table.records) {
            record[new_column_name] = record[old_column_name]
            delete record[old_column_name]
        }
        this._data.markModified(`tables.${table_name}.records`);
        return true
    }
    db.coerceColumn = function (table_name, column_name, column_type) {
        let table = this._data.tables[table_name]
        if (
            typeof column_name !== 'string' ||
            column_type.match(/string|number|boolean/) === null ||
            table === undefined
        )
            throw `invalid argument on table "${table_name}" column "${column_name}" type "${column_type}"`
        for (let record of table.records) {
            switch (column_type) {
                case 'boolean': {
                    record[column_name] = Boolean(record[column_name])
                    break
                }
                case 'number': {
                    record[column_name] = Number(record[column_name])
                    break
                }
                case 'string': {
                    record[column_name] = String(record[column_name])
                    break
                }
            }
        }
        this._data.markModified(`tables.${table_name}.records`)
        return true
    }
    db.getColumn = function (table_name, column_name) {
        let table = this._data.tables[table_name];
        let column = [];
        for(let record of table.records) {
            column.push((record[column_name] !== undefined ? record[column_name]: null))
        }
        return(column);
    }
    db.getColumnsForTable = function () {
        const columns = ['id']
        let { table_name } = req.query
        let table = this._data.tables[table_name]
        if (table === undefined) throw `no table found at "${table_name}"`
        for (let record of table.records) {
            for (let p in record) {
                if (columns.indexOf(p) < 0) columns.push(p)
            }
        }
        return columns
    }
    /*db.export_csv = function() {
    let { table_name } = req.query;
    let table = this._data.tables[table_name];
    if (table === undefined) throw `table "${table_name}" cannot be exported`;
fs.writeFileSync(`${self.csvPath}/${table_name}.csv`, self.jsonToCSV(table.records), "utf-8");
    return true;
  };*/
    db.readRecords = function (table_name) {
        let table = this._data.tables[table_name]
        if (table === undefined) throw `failed to read table ${table_name}`
        return table.records
    }
    db.clearTable = function (table_name) {
        let table = this._data.tables
        if (table[table_name] === undefined)
            throw `failed to clear table "${table_name}"`
        table[table_name] = { records: [], nextId: 1 }
        this._data.markModified(`tables.${table_name}`)
        return true
    }
    db.deleteRecord = function (table_name, record_id) {
        let table = this._data.tables[table_name]
        let index = table.records.findIndex(o=>o.id===record_id)
        if (table === undefined || index < 0) { 
            throw `failed to remove record on table "${table_name}" at id "${record_id}"`
        }
        table.records.splice(index, 1)
        this._data.markModified(`tables.${table_name}.records`)
        return true
    }
    db.deleteColumn = function (table_name, column_name) {
        let table = this._data.tables[table_name]
        if (table === undefined)
            throw `failed to remove column on table "${table_name}" at column "${column_name}"`
        for (let record of table.records) {
            if (record[column_name] !== undefined) {
                delete record[column_name]
            }
        }
        this._data.markModified(`tables.${table_name}.records`)
        return { table_name, column_name }
    }
    db.deleteTable = function (table_name) {
        let table = this._data.tables
        if (table[table_name] === undefined)
            throw `failed to delete the table "${table_name}"`
        delete table[table_name]
        this._data.markModified(`tables.${table_name}`)
        return true
    }
    db.getTableNames = function () {
        return Object.keys(this._data.tables)
    }
    db.getLibraryManifest = function () {
        return {}
    }
    db.projectHasData = function () {
        return (
            Object.keys(this._data.keyvalues).length > 0 ||
            Object.keys(this._data.tables).length > 0
        )
    }
    db.clearAllData = function () {
        this._data.keyvalues = {}
        this._data.tables = {}
        this._data.markModified("keyvalues")
        this._data.markModified("tables")
        return true
    }
    return db
}

// Api Interface
var TurboDBList = {}
setInterval(() => {
    for (var i in TurboDBList) {
        if (TurboDBList[i]._data.isModified()) {
            console.log('Saving changes to ' + i)
            TurboDBList[i]._data.save()
        }
        if (!TurboDBList[i]._read) {
            console.log('Removing ' + i + ' from RAM')
            delete TurboDBList[i]
            continue
        }
        TurboDBList[i]._changed = false
        TurboDBList[i]._read = false
    }
}, 60 * 1000)
function createLink(app, method, name, callback) {
    let parser = bigPass.indexOf(name) > -1 ? json({limit: "10mb"}): {}
    app[method]('/datablock_storage/:id/' + name, parser, async (req, res) => {
        // console.log(method, name, req.params.id, req.query, req.body)
        try {
            const id = req.params.id
            var db = TurboDBList[id]
            if (db === undefined) {
                db = await TurboDB(id)
                TurboDBList[id] = db
            }
            db._read = true
            // console.log(db)
            var ret = await callback(db, req)
            // console.log(ret)
            res.status(200).send(ret)
        } catch (e) {
            console.log(e)
            res.status(400).send({ Error: e })
        }
    })
}

module.exports = {
    Database: function (a) {
        const c = createLink
        c(a, 'get', 'get_key_value', (db, req) => db.getKeyValue(req.query.key))
        c(a, 'get', 'get_key_values', (db) => db.getAllKeyValues())
        c(a, 'post', 'set_key_value', (db, req) =>
            db.setKeyValue(req.body.key, req.body.value)
        )
        c(a, 'put', 'populate_key_values', (db, req) =>
            db.populateKeyValues(req.body.key_values_json)
        )
        c(a, 'delete', 'delete_key_value', (db, req) =>
            db.setKeyValue(req.body.key)
        )
        c(a, 'post', 'create_record', (db, req) =>
            db.createRecord(req.body.table_name, req.body.record_json)
        )
        c(a, 'post', 'create_table', (db, req) =>
            db.createTable(req.body.table_name)
        )
        c(a, 'post', 'add_column', (db, req) =>
            db.addColumn(req.body.column_name, req.body.table_name)
        )
        //c(a,"post","add_shared_table", (db,req) => db.add_shared_table(req.body.table_name));
        //c(a,"post","import_csv", (db,req) => db.import_csv(req.body.table_name, req.body.table_data_csv));
        c(a, 'put', 'populate_tables', (db, req) =>
            db.populateTables(req.body.tables_json)
        )
        c(a, 'put', 'update_record', (db, req) =>
            db.updateRecord(req.body.table_name, req.body.record_json)
        )
        c(a, 'put', 'rename_column', (db, req) =>
            db.renameColumn(
                req.body.table_name,
                req.body.old_column_name,
                req.body.new_column_name
            )
        )
        c(a, 'put', 'coerce_column', (db, req) =>
            db.coerceColumn(
                req.body.table_name,
                req.body.column_name,
                req.body.column_type
            )
        )
        c(a, 'get', 'get_column', (db, req) => db.getColumn(req.query.table_name, req.query.column_name))
        c(a, 'get', 'get_columns_for_table', (db, req) =>
            db.getColumnsForTable(req.query.table_name)
        )
        //c(a,"get","export_csv", (db,req) => db.export_csv(req.query.table_name));
        c(a, 'get', 'read_records', (db, req) =>
            db.readRecords(req.query.table_name)
        )
        c(a, 'delete', 'delete_record', (db, req) =>
            db.deleteRecord(req.body.table_name, req.body.record_id)
        )
        c(a, 'delete', 'delete_column', (db, req) =>
            db.deleteColumn(req.body.table_name, req.body.column_name)
        )
        c(a, 'delete', 'delete_table', (db, req) =>
            db.deleteTable(req.body.table_name)
        )
        c(a, 'get', 'get_table_names', (db) => db.getTableNames())
        c(a, 'get', 'get_library_manifest', (db) => db.getLibraryManifest())
        c(a, 'get', 'project_has_data', (db) => db.projectHasData())
        c(a, 'delete', 'clear_all_data', (db) => db.clearAllData())
    },
}
