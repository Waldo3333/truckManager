# app/controllers/employee/dashboard_controller.rb
class Employee::DashboardController < ApplicationController
  before_action :require_employee

  def index
    @user = current_user

    # Mes assignations aujourd'hui et demain
    @today = Date.today
    @tomorrow = Date.tomorrow

    @today_assignment = DailyAssignment.includes(:truck)
                                       .find_by(user: @user, date: @today)

    @tomorrow_assignment = DailyAssignment.includes(:truck)
                                          .find_by(user: @user, date: @tomorrow)

    # Mes interventions aujourd'hui
    @today_interventions = if @today_assignment
      Intervention.where(truck: @today_assignment.truck, date: @today)
                  .includes(:chantier)
                  .order(:start_time)
    else
      []
    end

    # Mes interventions demain
    @tomorrow_interventions = if @tomorrow_assignment
      Intervention.where(truck: @tomorrow_assignment.truck, date: @tomorrow)
                  .includes(:chantier)
                  .order(:start_time)
    else
      []
    end

    # Planning de l'équipe aujourd'hui
    @team_today = DailyAssignment.where(date: @today)
                                  .includes(:user, :truck)
                                  .order('users.email')
  end
end
