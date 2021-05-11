import { Injectable } from '@angular/core';
import * as AppSettings from '@nativescript/core/application-settings'
import { convertHSLToRGBColor } from '@nativescript/core/css/parser';
import { LocalNotifications } from '@nativescript/local-notifications';
import { Task } from './task'

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private tasks: Array<any>;
    private completes: Array<any>;
    public constructor() { 
        const openFirstTime = AppSettings.getBoolean("FistTime");

        /* check using app first time or not */
        if(openFirstTime == null || openFirstTime == undefined){
            this.tasks = []
            this.completes=[]
            AppSettings.setString("TaskData", JSON.stringify(this.tasks)); // store tasks data
            AppSettings.setString("TaskComplete", JSON.stringify(this.completes));
            AppSettings.setBoolean("FistTime", false);
        }
        else {
            this.tasks = JSON.parse(AppSettings.getString("TaskData")); // get task data that store in app settings
            this.tasks.forEach((task) => {task.due_date = new Date(Date.parse(task.due_date))}) // convert from string to Date type
            this.completes = JSON.parse(AppSettings.getString("TaskComplete")); 
            
        
        }
    }

    public setOverdue(id: number, overdue: boolean){
        this.tasks.find(task => task.id == id).overdue = overdue
    }

    public getTasks(): Array<any> {
        return this.tasks;
    }

    public getCompleteTask(): Array<any>{
        return this.completes;
    }

    public getTask(id: number){
        return this.tasks.filter(x => x.id == id)[0];
    }

    public addTask(name: string, detail:string, datetime:Date, photoPath:Array<string>, notify:boolean, overdue:boolean){
        let last_id: number;
        
        /* get id */
        this.tasks.length > 0 ? last_id=this.tasks[this.tasks.length-1].id : last_id=0
        this.tasks.push(
            {
              'id': last_id+1,
              'name': name == undefined ? name='':name,
              'detail': detail,
              'due_date': datetime,
              'photo': photoPath,
              'notify': notify,
              'overdue': overdue,
            }
        );
        this.tasks.sort((a, b) => a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0) // sort tasks by due date
        this.tasks.map(task => task.id = this.tasks.indexOf(task)) // reorder id
        AppSettings.setString("TaskData", JSON.stringify(this.tasks));

        if(notify){
            this.setNotify(last_id+1, name, datetime)
        }
    }

    public editTask(id:number, name: string, detail:string, datetime:Date, photoPath:Array<string>, notify:boolean, overdue:boolean){
        this.tasks[id] = {
            'id': id,
            'name': name,
            'detail': detail,
            'due_date': datetime,
            'photo': photoPath,
            'notify': notify,
            'overdue': overdue,
        }
        this.tasks.sort((a, b) => a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0) // sort tasks by due date
        this.tasks.map(task => task.id = this.tasks.indexOf(task)) // reorder id
        AppSettings.setString("TaskData", JSON.stringify(this.tasks));

        /* set notify */
        let now = new Date()
        if(notify && datetime > now){
            this.setNotify(id, name, datetime)
        }
    }

    public deleteTask(id:number){
        for(let i = 0; i < this.tasks.length; i++) {
            if(this.tasks[i].id == id) {
              this.tasks.splice(i, 1);
              this.tasks.sort((a, b) => a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0) // sort tasks by due date
              break;
            }
        }
        this.tasks.map(task => task.id = this.tasks.indexOf(task)) // reorder id
        AppSettings.setString("TaskData", JSON.stringify(this.tasks))
    }


    public completeTask(id:number){
        let last_id: number;
        let x=this.tasks.filter(x => x.id == id)[0];
        this.completes.length > 0 ? last_id=this.completes[this.completes.length-1].id : last_id=0
        this.completes.push(
            {
              'id': last_id+1,
              'name': x.name,
              'detail': x.detail,
              'due_date': x.due_date,
              'photo': x.photo,
              'notify': x.notify,
              'overdue': x.overdue,
            }
        );
        this.completes.sort((a, b) => a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0) // sort tasks by due date
        this.completes.map(completeTask => completeTask.id = this.completes.indexOf(completeTask)) // reorder id
        AppSettings.setString("TaskComplete", JSON.stringify(this.completes));
    }

    
    

    private setNotify(id:number, name:string, datetime:Date){
        let date_notify = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()-1,
        datetime.getHours(), datetime.getMinutes())

        LocalNotifications.schedule([
            {
                id: id,
                title: 'Task Reminder',
                body: "ครบกำหนดพรุ่งนี้: " + name,
                badge: 1,
                icon: 'res//logo',
                at: date_notify,
                forceShowWhenInForeground: true,
            },
        ])
    }
}