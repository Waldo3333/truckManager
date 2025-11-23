# app/controllers/employee/schedule_controller.rb
class Employee::ScheduleController < ApplicationController
  layout "employee"
  before_action :require_employee

  def index
    @user = current_user

    # Date sélectionnée (par défaut : aujourd'hui)
    @selected_date = params[:date]&.to_date || Date.today

    # Mon assignation du jour
    @my_assignment = DailyAssignment.includes(:truck)
                                    .find_by(user: @user, date: @selected_date)

    # Mes interventions du jour
    @my_interventions = if @my_assignment
      Intervention.where(truck: @my_assignment.truck, date: @selected_date)
                  .includes(:chantier)
                  .order(:start_time)
    else
      []
    end

    # Pour le calendrier : mes jours de travail du mois
    @month_start = @selected_date.beginning_of_month
    @month_end = @selected_date.end_of_month
    @my_work_days = DailyAssignment.where(user: @user, date: @month_start..@month_end)
                                   .pluck(:date)

    # Mode comparaison : planning d'un collègue
    if params[:compare_user_id].present?
      @compare_user = User.find_by(id: params[:compare_user_id])

      if @compare_user
        @compare_assignment = DailyAssignment.includes(:truck)
                                            .find_by(user: @compare_user, date: @selected_date)

        @compare_interventions = if @compare_assignment
          Intervention.where(truck: @compare_assignment.truck, date: @selected_date)
                      .includes(:chantier)
                      .order(:start_time)
        else
          []
        end
      end
    end

    # Liste des collègues (pour navigation)
    @colleagues = User.where(admin: false)
                     .where.not(id: @user.id)
                     .order(:email)
  end
  def calendar
    @selected_date = params[:date]&.to_date || Date.today
    @month_start = @selected_date.beginning_of_month
    @month_end = @selected_date.end_of_month
    @my_work_days = DailyAssignment.where(user: current_user, date: @month_start..@month_end)
                                  .pluck(:date)

    render partial: 'calendar_grid', locals: {
      selected_date: @selected_date,
      month_start: @month_start,
      month_end: @month_end,
      my_work_days: @my_work_days,
      compare_user_id: params[:compare_user_id]
    }
  end
end
