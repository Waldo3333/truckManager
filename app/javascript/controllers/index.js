// app/javascript/controllers/index.js

// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "./application";
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading";
eagerLoadControllersFrom("controllers", application);

import ModalController from "./modal_controller";
application.register("modal", ModalController);

import EmployeeScheduleController from "./employee_schedule_controller";
application.register("employee-schedule", EmployeeScheduleController);
