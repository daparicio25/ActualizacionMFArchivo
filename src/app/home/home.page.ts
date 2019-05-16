import { Component } from '@angular/core';

//FIREBASE
import { AngularFirestore } from 'angularfire2/firestore';

//DATOS
import { MEDITIONS } from "../modAnterior/data.modAnterior";
import { USERS } from "../modAnterior/data.users";

//Interfaces
import { meditionsNewModel } from "../interfaces/newModel.interface";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  datosAnt: any[] = [];
  datosUsr: any[] = [];
  data: meditionsNewModel;
  strLog: string = "";

  //Logs variables
  sinUsr: number = 0;
  sinWgt: number = 0;
  total: number = 0;

  constructor(private fire: AngularFirestore) {
    this.datosAnt = MEDITIONS.slice(0);
    this.datosUsr = USERS.slice(0);
  }

  crearCopia() {
    this.fire.collection('meditions').valueChanges().subscribe((data) => {
      console.log(data);
      this.log(JSON.stringify(data), "Respaldo_meditions");
    });
  }

  crearCopiaUser() {
    this.fire.collection('users').valueChanges().subscribe((data) => {
      console.log(data);
      this.log(JSON.stringify(data), "Respaldo_users");
    });
  }

  proceso() {
    for (let i=0; i<this.datosAnt.length; i++) {
      this.strLog += "\n\n*****************************************\n";
      this.strLog += "\t" + i + " >> " + this.datosAnt[i].user_uid;

      //Consulta su weightUnit
      let user:any = this.datosUsr.filter(userObj => userObj.uid == this.datosAnt[i].user_uid);

      if(user[0] == undefined) {
        this.strLog += "-- Sin User ";
        this.strLog += "\n*****************************************\n";
        this.sinUsr++;
      } else {
        if (user[0].weight_unity == undefined) {
          this.strLog += "-- Sin weight_unity ";
          this.strLog += "\n*****************************************\n";
          this.sinWgt++;
        } else {
          this.strLog += " => " + JSON.stringify(user[0].weight_unity);
          this.strLog += "\n*****************************************\n";
          this.spliceData(this.datosAnt[i], JSON.stringify(user[0].weight_unity));
        }
      }
    }

    this.strLog += "\n\nTotal de registros sin usuario: " + this.sinUsr;
    this.strLog += "\nTotal de registros sin unidad de peso: " + this.sinWgt;
    this.strLog += "\nTotal de registros nuevos: " + this.total;

    this.log(this.strLog, "meditions_log");
  }

  spliceData(item, unit) {

    for (var key in item) {
      var arre = ["uid", "medition_type", "created_at", "user_uid"];
      if (arre.indexOf(key) == -1 && item[key] != null && item[key] != "0" && item[key] != "0.00") {
        this.strLog += "\t" + key + " --> " + item[key] + "\n";
        let idDoc = this.fire.createId();
        this.data = this.newMedition(idDoc, item["created_at"], item["user_uid"], key, item[key], unit, item["medition_type"])

        this.fire.doc("/meditionsNewModel/" + idDoc).set(this.data);
        this.total++;
      }
    }
  }

  newMedition(id:string, effectiveDateTime:string, subject:string, key:string, value:number, unit: string, medition_type:number): meditionsNewModel {
    return {
      _id: id,
      effectiveDateTime: effectiveDateTime,
      subject: subject,
      code: {
        text: key,
      },
      valueQuantity: {
        value: value,
        unit: this.GetMeasure(key, unit)
      },
      deviceName: {
        name: this.getDevice(medition_type)
      }
    };
  }

  GetMeasure(key: string, unit: string): string {
    let meditions = "";

    switch(key) {
      case "weight":
      case "muscle_mass":
      case "bonne_mass":
        meditions = "kg";
        break;
      case "bmi":
        meditions = "kg/m²";
        break;
      case "tmb":
        meditions = "Kcal";
        break;
      case "visceral_fat":
      case "body_fat":
      case "body_water":
        meditions = "%";
        break;
      case "metabolic_age":
        meditions = "";
        break;
      case "diastolic_pressure":
      case "systolic_pressure":
        meditions = "mmHg";
        break;
      case "heart_rate":
        meditions = "lat/min";
        break;
      case "glucose":
      case "urico_acid":
      case "cholesterol":
        meditions = "mg/dl";
        break;
      case "stomach":
      case "hip":
      case "chest":
      case "biceps":
      case "thigh":
      case "calf":
      case "neck":
      case "size":
      case "head":
      case "height_baby":
        meditions = "cm";
        break;
      default:
        console.log("\n--- DEFAULT ERROR ---");
    }

    if (unit.toLowerCase() == "lb") {
      if (meditions.toLowerCase() == "kg") { meditions = "lb"; }

      if (meditions.toLowerCase() == "cm") { meditions = "in"; }
    }
    return meditions;
  }

  getDevice(medition_type: number): string {
    let device = "";

    switch(medition_type) {
      case 1:
        device = "Scale MedicoFitness";
        break;
      case 2:
        device = "Heart MedicoFitness";
        break;
      case 3:
        device = "GCU MedicoFitness";
        break;
      case 5:
          device = "Corporal MedicoFitness";
          break;
    }

    return device;
  }

  log(contenido: string, nombre: string) {
    document.getElementById('link').setAttribute("download", nombre);
    document.getElementById('link').setAttribute("href", 'data:text/plain;charset=utf-8,'+ encodeURIComponent(contenido));
    document.getElementById('link').click();
  }

}
