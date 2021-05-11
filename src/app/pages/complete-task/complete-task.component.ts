import { Component} from "@angular/core";
import { ActivatedRoute, Router} from '@angular/router';
import { Task } from "~/app/task";
import { TaskService } from "../../task.service";
import { Location} from "@angular/common";
import { Subscription, interval } from 'rxjs';
import { DatePipe } from '@angular/common'

@Component ({
    selector: "CompleteTask",
    templateUrl: "./complete-task.component.html",
    styleUrls: ['./complete-task.component.css'],
})
export class CompleteTaskComponent {
  task;
  complete;
  checklist_id;
  constructor(public route: ActivatedRoute,
              public taskService: TaskService,
              public location: Location,
              public router: Router, 
              public datepipe: DatePipe,
              )
              {
  }

  ngOnInit() {
    this.complete= this.taskService.getCompleteTask();
}

public convertDatetime(datetime: Date){
    let now = Date.now()
    let date_now = this.datepipe.transform(now, 'dd/MM/yyyy')
    let dueDate = this.datepipe.transform(datetime, 'dd/MM/yyyy h:mm a').split(" ")

    if (date_now == dueDate[0]){
        // duedate is today
        return this.formatString('Today, {0} {1}',dueDate[1],dueDate[2])
    }
    else {
        return this.formatString('{0}, {1} {2}',dueDate[0],dueDate[1],dueDate[2])
    }
}

/* check noun is plural or not */
pluralize(count, noun, suffix = 's'){
    return `${count} ${noun}${count !== 1 ? suffix : ''}`
}

formatString(str: string, ...val: string[]) {
    for (let index = 0; index < val.length; index++) {
      str = str.replace(`{${index}}`, val[index]);
    }
    return str;
}


checklist(id : number){
    this.checklist_id = id
    let x=this.complete.filter(x => x.id == id)[0];
    setTimeout(() => {
        this.taskService.addTask(x.name, x.detail, x.due_date, x.photo, x.notify, x.overdue)
        this.taskService.deleteCompleteTask(id)
        this.checklist_id = undefined
    }, 300);
}
}
