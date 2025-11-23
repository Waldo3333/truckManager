// app/javascript/controllers/index.js
import { application } from "./application";

// Enregistrer manuellement chaque controller
import HelloController from "./hello_controller";
application.register("hello", HelloController);

import InfoCardController from "./info_card_controller";
application.register("info-card", InfoCardController);

import ModalController from "./modal_controller";
application.register("modal", ModalController);

import EmployeeScheduleController from "./employee_schedule_controller";
application.register("employee-schedule", EmployeeScheduleController);

export { application };
