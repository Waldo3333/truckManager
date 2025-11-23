pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true

# Pin explicite de chaque controller
pin "controllers/application", to: "controllers/application.js", preload: true
pin "controllers/hello_controller", to: "controllers/hello_controller.js", preload: true
pin "controllers/index", to: "controllers/index.js", preload: true
pin "controllers/info_card_controller", to: "controllers/info_card_controller.js", preload: true
pin "controllers/modal_controller", to: "controllers/modal_controller.js", preload: true
pin "controllers/employee_schedule_controller", to: "controllers/employee_schedule_controller.js", preload: true

# Planning
pin "planning", preload: true
